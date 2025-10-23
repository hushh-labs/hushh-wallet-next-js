import { NextRequest, NextResponse } from 'next/server';
import { generateAppleWalletPass, generateDemoPass } from '@/lib/productionPassGenerator';
import { verifyPassToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, name, preferences } = body;

    if (!token || !name || !preferences) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the JWT token
    const decoded = verifyPassToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const passData = {
      name,
      preferences: preferences || []
    };

    try {
      // Try to generate actual Apple Wallet pass
      const passBuffer = await generateAppleWalletPass(passData);
      
      // If successful, return the pass as a downloadable file
      return new NextResponse(passBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': `attachment; filename="HushOne-${name.replace(/[^a-zA-Z0-9]/g, '')}.pkpass"`,
        },
      });
    } catch (passError) {
      console.log('Pass generation failed, falling back to demo mode:', passError);
      
      // Fall back to demo response
      const demoData = await generateDemoPass(passData);
      return NextResponse.json(demoData);
    }
  } catch (error) {
    console.error('Error creating pass:', error);
    return NextResponse.json(
      { error: 'Failed to create pass' },
      { status: 500 }
    );
  }
}
