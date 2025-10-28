import { NextRequest, NextResponse } from 'next/server';
import { verifyPassToken } from '@/lib/jwt';
import { generateAppleWalletPass, generateDemoPass } from '@/lib/productionPassGenerator';

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

    // Create user-friendly preferences list
    const preferencesList = [
      claim.prefs.foodType,
      claim.prefs.spice,
      ...claim.prefs.cuisines,
      ...claim.prefs.dishes,
      ...claim.prefs.exclusions
    ].filter(Boolean);

    // Generate default name based on preferences
    const defaultName = `${claim.prefs.foodType} ${claim.prefs.spice} Lover`;

    const passData = {
      name: defaultName,
      preferences: preferencesList
    };

    try {
      // Try to generate actual Apple Wallet pass
      const passBuffer = await generateAppleWalletPass(passData);
      
      // If successful, return the pass as a downloadable file
      return new NextResponse(passBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': `attachment; filename="HushOne-${defaultName.replace(/[^a-zA-Z0-9]/g, '')}.pkpass"`,
        },
      });
    } catch (passError) {
      console.log('Pass generation failed, showing demo info:', passError);
      
      // Fall back to demo JSON response
      const demoData = await generateDemoPass(passData);
      
      return NextResponse.json(demoData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

  } catch (error) {
    console.error('Wallet route error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pass' },
      { status: 500 }
    );
  }
}
