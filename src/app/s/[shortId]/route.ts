import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Short URL redirect handler - Apple Wallet safe (no hyphens, no breaking)
export async function GET(request: NextRequest, { params }: { params: { shortId: string } }) {
  try {
    const { shortId } = params;

    // Get short URL mapping
    const { data: shortUrl, error } = await supabaseAdmin
      .from('short_urls')
      .select('uid, token')
      .eq('short_id', shortId)
      .single();

    if (error || !shortUrl) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Update access count
    await supabaseAdmin.rpc('increment_access_count', { 
      short_id_param: shortId 
    });

    // Redirect to full profile completion URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hushh-gold-pass-mvp.vercel.app';
    const redirectUrl = `${baseUrl}/complete/${shortUrl.uid}?token=${shortUrl.token}`;
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Short URL redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
