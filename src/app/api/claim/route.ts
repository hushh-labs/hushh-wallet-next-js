import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { 
  canonicalizeIdentity, 
  generateUID, 
  generateEditToken, 
  hashEditToken,
  generateMemberUrls,
  generateShortId,
  generateShortUrl
} from '@/lib/uid';

// Rate limiting helper
async function checkRateLimit(ip: string): Promise<boolean> {
  const bucket = `claim:${ip}`;
  const now = new Date();
  const hourStart = new Date(now.getTime() - (now.getMinutes() * 60000) - (now.getSeconds() * 1000) - now.getMilliseconds());
  
  try {
    // Check existing rate limit
    const { data: existing } = await supabaseAdmin
      .from('rate_limits')
      .select('count, reset_at')
      .eq('bucket', bucket)
      .single();

    if (existing) {
      if (new Date(existing.reset_at) > now) {
        // Within current hour
        if (existing.count >= 10) { // Max 10 claims per IP per hour
          return false;
        }
        // Increment count
        await supabaseAdmin
          .from('rate_limits')
          .update({ count: existing.count + 1 })
          .eq('bucket', bucket);
      } else {
        // New hour, reset
        await supabaseAdmin
          .from('rate_limits')
          .update({ 
            count: 1, 
            reset_at: new Date(hourStart.getTime() + 3600000).toISOString() 
          })
          .eq('bucket', bucket);
      }
    } else {
      // First request from this IP
      await supabaseAdmin
        .from('rate_limits')
        .insert({
          bucket,
          count: 1,
          reset_at: new Date(hourStart.getTime() + 3600000).toISOString()
        });
    }
    
    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow on error
  }
}

// Log event helper
async function logEvent(uid: string, type: string, meta: any = {}) {
  try {
    await supabaseAdmin
      .from('pass_events')
      .insert({
        uid,
        type,
        meta_json: meta
      });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    const rateLimited = await checkRateLimit(ip);
    if (!rateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email, phone } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required.' },
        { status: 400 }
      );
    }

    // Canonicalize identity
    const canonical = canonicalizeIdentity({ name, email, phone });
    if (!canonical) {
      return NextResponse.json(
        { error: 'Invalid name, email, or phone number format.' },
        { status: 400 }
      );
    }

    // Generate deterministic UID
    const uid = generateUID(canonical);

    // Generate edit token
    const editToken = generateEditToken();
    const editTokenHash = hashEditToken(editToken);

    // Generate URLs
    const urls = generateMemberUrls(uid, editToken);

    try {
      // Check if member already exists
      const { data: existing } = await supabaseAdmin
        .from('members')
        .select('uid, pass_status')
        .eq('uid', uid)
        .single();

      if (existing) {
        // Member exists, return existing pass info
        await logEvent(uid, 'claim_submitted', { 
          ip, 
          existing: true,
          user_agent: request.headers.get('user-agent')
        });

        return NextResponse.json({
          uid,
          addToWalletUrl: `/api/passes/gold?uid=${uid}`,
          profileUrl: urls.profile_url,
          existing: true
        });
      }

      // Generate short URL for Apple Wallet (no hyphens, no breaking)
      const shortId = generateShortId();
      const shortUrl = generateShortUrl(shortId);

      // Create new member
      const { error: insertError } = await supabaseAdmin
        .from('members')
        .insert({
          uid,
          name: canonical.name,
          email: canonical.email,
          phone_e164: canonical.phone_e164,
          edit_token_hash: editTokenHash,
          public_url: urls.public_url,
          profile_url: shortUrl, // Use short URL for Apple Wallet
          pass_status: 'active'
        });

      if (insertError) {
        console.error('Failed to create member:', insertError);
        return NextResponse.json(
          { error: 'Failed to create member account.' },
          { status: 500 }
        );
      }

      // Create short URL mapping
      await supabaseAdmin
        .from('short_urls')
        .insert({
          short_id: shortId,
          uid,
          token: editToken // Store plaintext token for redirect
        });

      // Log successful claim
      await logEvent(uid, 'claim_submitted', {
        ip,
        user_agent: request.headers.get('user-agent'),
        utm_source: request.nextUrl.searchParams.get('utm_source'),
        utm_medium: request.nextUrl.searchParams.get('utm_medium'),
        utm_campaign: request.nextUrl.searchParams.get('utm_campaign')
      });

      return NextResponse.json({
        uid,
        addToWalletUrl: `/api/passes/gold?uid=${uid}`,
        profileUrl: urls.profile_url,
        existing: false
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Claim API error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
