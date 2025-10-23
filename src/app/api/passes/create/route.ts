import { NextRequest, NextResponse } from 'next/server';
import { generateAppleWalletPass, generateDemoPass } from '@/lib/productionPassGenerator';
import { generatePassToken } from '@/lib/jwt';
import { TastePayload } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TastePayload;
    
    // Validate the TastePayload
    if (!body.foodType || !body.spice) {
      return NextResponse.json({ error: 'Food Type and Spice are required' }, { status: 400 });
    }

    // Generate a token for this payload
    const token = generatePassToken(body);
    
    // Create user-friendly preferences list
    const preferencesList = [
      body.foodType,
      body.spice,
      ...body.cuisines,
      ...body.brands,
      ...body.lifestyle
    ].filter(Boolean);

    // Generate default name based on preferences
    const defaultName = `${body.foodType} ${body.spice} Lover`;

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
      console.log('Pass generation failed, falling back to demo mode:', passError);
      
      // Fall back to demo response with a proper URL for demo
      const demoData = await generateDemoPass(passData);
      
      // Return demo data with a wallet URL that redirects to pass
      return NextResponse.json({
        ...demoData,
        url: `/api/wallet/${token}`
      });
    }
  } catch (error) {
    console.error('Error creating pass:', error);
    return NextResponse.json(
      { error: 'Failed to create pass' },
      { status: 500 }
    );
  }
}
