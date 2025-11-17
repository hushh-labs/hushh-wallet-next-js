import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const uid = params.uid;

    if (!uid) {
      return NextResponse.json(
        { error: 'UID parameter is required' },
        { status: 400 }
      );
    }

    // Get member verification data (PII-safe)
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('uid, name, pass_status, created_at')
      .eq('uid', uid)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { 
          uid, 
          tier: 'GOLD', 
          status: 'not_found',
          error: 'Member not found'
        },
        { status: 404 }
      );
    }

    // Update last seen timestamp
    await supabaseAdmin
      .from('members')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('uid', uid);

    // Log QR scan event
    await logEvent(uid, 'qr_scanned', {
      user_agent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 'unknown',
      utm_source: request.nextUrl.searchParams.get('utm_source'),
      utm_medium: request.nextUrl.searchParams.get('utm_medium'),
      utm_campaign: request.nextUrl.searchParams.get('utm_campaign')
    });

    // Determine response based on Accept header
    const acceptHeader = request.headers.get('accept') || '';
    
    if (acceptHeader.includes('text/html')) {
      // Return HTML response for browser viewing
      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HUSHH Gold Pass Verification</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #75410a 0%, #d4b26f 100%);
              color: #fff;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .card {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 16px;
              padding: 32px;
              text-align: center;
              max-width: 400px;
              width: 100%;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 16px;
            }
            .status-active {
              background: rgba(34, 197, 94, 0.2);
              color: #22c55e;
              border: 1px solid rgba(34, 197, 94, 0.3);
            }
            .status-voided {
              background: rgba(239, 68, 68, 0.2);
              color: #ef4444;
              border: 1px solid rgba(239, 68, 68, 0.3);
            }
            h1 {
              margin: 0 0 8px 0;
              font-size: 28px;
              font-weight: 700;
            }
            .tier {
              font-size: 18px;
              color: #d4b26f;
              margin: 0 0 24px 0;
            }
            .member-name {
              font-size: 20px;
              margin: 0 0 16px 0;
            }
            .timestamp {
              font-size: 14px;
              color: rgba(255, 255, 255, 0.7);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="status-badge ${member.pass_status === 'active' ? 'status-active' : 'status-voided'}">
              ${member.pass_status === 'active' ? '✓ VALID' : '✗ VOIDED'}
            </div>
            <h1>HUSHH</h1>
            <div class="tier">GOLD PASS</div>
            <div class="member-name">${member.name}</div>
            <div class="timestamp">
              Member since ${new Date(member.created_at).toLocaleDateString()}
            </div>
          </div>
        </body>
        </html>
      `;
      
      return new NextResponse(htmlResponse, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Return JSON response for API calls
    return NextResponse.json({
      uid: member.uid,
      tier: 'GOLD',
      status: member.pass_status,
      memberName: member.name,
      verified: member.pass_status === 'active'
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { 
        uid: params.uid,
        tier: 'GOLD',
        status: 'error',
        error: 'Verification failed'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
