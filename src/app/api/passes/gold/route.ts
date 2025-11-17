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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { error: 'UID parameter is required' },
        { status: 400 }
      );
    }

    // Get member from database
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('uid', uid)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    if (member.pass_status !== 'active') {
      return NextResponse.json(
        { error: 'Pass is not active' },
        { status: 403 }
      );
    }

    // Prepare pass payload for Hushh Wallet API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hushh-gold-pass-mvp.vercel.app';
    
    const passPayload = {
      passType: "storeCard",
      organizationName: "HUSHH",
      description: "HUSHH Gold Pass",
      serialNumber: `gold-${uid}`,
      teamIdentifier: "HUSHH",
      backgroundColor: "rgb(117, 65, 10)", // Royal gold
      foregroundColor: "rgb(255, 248, 235)", // Light cream
      labelColor: "rgb(216, 178, 111)", // Gold accent
      logoText: "HUSHH",
      
      // Header field - right-aligned HUSHH branding
      headerFields: [
        {
          key: "brand",
          value: "HUSHH",
          textAlignment: "PKTextAlignmentRight"
        }
      ],
      
      // Primary fields (minimal front face)
      primaryFields: [
        {
          key: "tier",
          label: "TIER",
          value: "GOLD"
        }
      ],
      
      // Secondary fields
      secondaryFields: [
        {
          key: "member",
          label: "MEMBER",
          value: member.name
        }
      ],
      
      // Back fields - profile completion link
      backFields: [
        {
          key: "profile",
          label: "Complete your profile",
          value: member.profile_url
        },
        {
          key: "verify",
          label: "Verification",
          value: member.public_url
        }
      ],
      
      // Barcode/QR Code
      barcode: {
        message: member.public_url,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
        altText: `HUSHH Gold Pass - ${uid}`
      },
      
      // Pass behavior
      sharingProhibited: true,
      maxDistance: 100,
      
      // Relevance
      relevantDate: new Date().toISOString()
    };

    try {
      // Call Hushh Wallet API
      const walletApiUrl = process.env.HUSHH_WALLET_API_URL || 'https://hushh-wallet.vercel.app/api/passes/universal/create';
      
      const walletResponse = await fetch(walletApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passPayload)
      });

      if (!walletResponse.ok) {
        const errorText = await walletResponse.text();
        console.error('Hushh Wallet API error:', walletResponse.status, errorText);
        
        // Log API error
        await logEvent(uid, 'api_error', {
          error: 'wallet_api_failed',
          status: walletResponse.status,
          message: errorText
        });

        return NextResponse.json(
          { error: 'Failed to generate pass' },
          { status: 500 }
        );
      }

      // Get pass serial from response headers if available
      const passSerial = walletResponse.headers.get('x-pass-serial') || 
                         walletResponse.headers.get('pass-serial') ||
                         `gold-${uid}`;

      // Update member with pass serial
      if (passSerial && passSerial !== member.pass_serial) {
        await supabaseAdmin
          .from('members')
          .update({ pass_serial: passSerial })
          .eq('uid', uid);
      }

      // Log successful pass generation
      await logEvent(uid, 'pass_issued', {
        pass_serial: passSerial,
        user_agent: request.headers.get('user-agent')
      });

      // Stream the pass file back to client
      const passBuffer = await walletResponse.arrayBuffer();
      
      return new NextResponse(passBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': `attachment; filename="hushh-gold-${uid}.pkpass"`,
          'Cache-Control': 'no-cache'
        }
      });

    } catch (fetchError) {
      console.error('Failed to call Hushh Wallet API:', fetchError);
      
      // Log API error
      await logEvent(uid, 'api_error', {
        error: 'wallet_api_failed',
        message: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      });

      return NextResponse.json(
        { error: 'Pass generation service unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Pass generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
