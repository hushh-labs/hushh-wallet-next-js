import { NextRequest, NextResponse } from 'next/server';
import { verifyPassToken } from '@/lib/jwt';
import { generateSimplePass } from '@/lib/simplePassGenerator';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // Verify token
    const claim = verifyPassToken(token);
    if (!claim) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 410 }
      );
    }

    // Generate pass (demo version)
    const passContent = generateSimplePass(claim.serial, claim.prefs);
    
    // Return pass data with correct headers for demo
    return new NextResponse(passContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${claim.serial}-demo.json"`,
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
