import { NextRequest, NextResponse } from 'next/server';
import { verifyPassToken } from '@/lib/jwt';
import { generateSimplePass } from '@/lib/simplePassGenerator';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    
    // Verify token
    const claim = verifyPassToken(token);
    if (!claim) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 410 }
      );
    }

    // Generate pass
    const passBuffer = generateSimplePass(claim.serial, claim.prefs);
    
    // Return pass with correct headers
    return new NextResponse(passBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${claim.serial}.pkpass"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Wallet route error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pass' },
      { status: 500 }
    );
  }
}
