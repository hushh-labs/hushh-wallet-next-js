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

// URL sanitization helper for Apple Wallet compatibility
function sanitizeUrlForAppleWallet(url: string): string {
  if (!url) return '';
  
  // Remove all whitespace characters (spaces, newlines, tabs, etc.)
  // and ensure it's a single continuous string
  const cleanUrl = url.replace(/\s+/g, '').trim();
  
  // Validate that it's a proper HTTPS URL
  try {
    const urlObj = new URL(cleanUrl);
    if (urlObj.protocol === 'https:') {
      return cleanUrl;
    }
  } catch (error) {
    console.error('Invalid URL format:', cleanUrl);
  }
  
  return cleanUrl; // Return even if validation fails, but cleaned
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
      description: "HUSHH Royal Gold Pass",
      serialNumber: `gold-${uid}`,
      teamIdentifier: "HUSHH",
      backgroundColor: "rgb(212, 175, 55)", // Bright luxury gold for shine effect #D4AF37
      foregroundColor: "rgb(255, 255, 255)", // Pure white for maximum contrast
      labelColor: "rgb(255, 223, 0)", // Bright gold labels #FFDF00  
      logoText: "HUSHH",
      suppressStripShine: false, // Enable shine effect for luxury feel
      
      // Header field - luxury branding
      headerFields: [
        {
          key: "brand",
          value: "HUSHH",
          textAlignment: "PKTextAlignmentLeft"
        },
        {
          key: "status",
          value: "ROYAL MEMBER",
          textAlignment: "PKTextAlignmentRight"
        }
      ],
      
      // Primary fields - prominent tier display
      primaryFields: [
        {
          key: "tier",
          label: "TIER",
          value: "ROYAL GOLD"
        }
      ],
      
      // Secondary fields
      secondaryFields: [
        {
          key: "member",
          label: "MEMBER",
          value: member.name
        },
        {
          key: "issued",
          label: "ISSUED",
          value: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        }
      ],
      
      // Back fields - enhanced professional content with branding
      backFields: [
        {
          key: "about",
          label: "About Hushh AI",
          value: "Personal and Business AI Agent Solutions for Financial Advisory and Lifestyle Industries",
          textAlignment: "PKTextAlignmentLeft"
        },
        {
          key: "profile",
          label: "Complete Your Hushh Profile",
          value: sanitizeUrlForAppleWallet(member.profile_url),
          dataDetectorTypes: ["PKDataDetectorTypeLink"],
          textAlignment: "PKTextAlignmentLeft"
        },
        {
          key: "networth",
          label: "Hushh Wealth Analysis",
          value: sanitizeUrlForAppleWallet(`${baseUrl}/networth/${uid}`),
          dataDetectorTypes: ["PKDataDetectorTypeLink"],
          textAlignment: "PKTextAlignmentLeft"
        },
        {
          key: "verify",
          label: "Hushh Verification Center",
          value: sanitizeUrlForAppleWallet(member.public_url),
          dataDetectorTypes: ["PKDataDetectorTypeLink"],
          textAlignment: "PKTextAlignmentLeft"
        },
        {
          key: "headquarters",
          label: "Global Headquarters",
          value: "1021 5th St W, Kirkland, WA 98033, United States\n+1 (888) 462-1726",
          textAlignment: "PKTextAlignmentLeft"
        },
        {
          key: "support",
          label: "24/7 Customer Support",
          value: "+1 (765) 532-4284",
          dataDetectorTypes: ["PKDataDetectorTypePhoneNumber"],
          textAlignment: "PKTextAlignmentLeft"
        },
        {
          key: "ceo_message",
          label: "Your Data. Your Business.",
          value: "Building with love, Hushh.ai\n- Manish Sainani, CEO",
          textAlignment: "PKTextAlignmentCenter"
        }
      ],
      
      // Barcode/QR Code
      barcode: {
        message: sanitizeUrlForAppleWallet(member.public_url),
        format: "PKBarcodeFormatQR",
        messageEncoding: "utf-8",
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
      const walletApiUrl = process.env.HUSHH_WALLET_API_URL || 'http://localhost:3001/api/passes/universal/create';
      
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
