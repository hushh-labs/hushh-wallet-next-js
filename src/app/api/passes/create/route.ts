import { NextRequest, NextResponse } from 'next/server';
import { generateCorrectAppleWalletPass } from '@/lib/correctPassGenerator';
import { generateRealAppleWalletPass } from '@/lib/realPassGenerator';
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
      ...body.dishTypes,
      ...body.dietary
    ].filter(Boolean);

    // Generate default name based on preferences
    const defaultName = `${body.foodType} ${body.spice} Lover`;

    const passData = {
      name: defaultName,
      preferences: preferencesList
    };

    try {
      // Try the CORRECT passkit-generator approach first
      console.log('Attempting to generate Apple Wallet pass with correct passkit-generator approach...');
      const passBuffer = await generateCorrectAppleWalletPass(passData);
      
      console.log('Correct pass generated successfully! Returning .pkpass file');
      
      // Return the actual .pkpass file for download
      return new NextResponse(passBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': `attachment; filename="HushOne-${defaultName.replace(/[^a-zA-Z0-9]/g, '')}.pkpass"`,
        },
      });
    } catch (correctPassError) {
      console.log('Correct pass generation failed, trying alternative method:', correctPassError);
      
      try {
        // Try alternative method
        const passBuffer = await generateRealAppleWalletPass(passData);
        
        console.log('Alternative pass generated successfully!');
        
        return new NextResponse(passBuffer as any, {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.apple.pkpass',
            'Content-Disposition': `attachment; filename="HushOne-${defaultName.replace(/[^a-zA-Z0-9]/g, '')}.pkpass"`,
          },
        });
      } catch (altPassError) {
        console.log('Alternative method failed, trying fallback:', altPassError);
        
        try {
          // Try final fallback method
          const passBuffer = await generateAppleWalletPass(passData);
          
          return new NextResponse(passBuffer as any, {
            status: 200,
            headers: {
              'Content-Type': 'application/vnd.apple.pkpass',
              'Content-Disposition': `attachment; filename="HushOne-${defaultName.replace(/[^a-zA-Z0-9]/g, '')}.pkpass"`,
            },
          });
        } catch (fallbackError) {
          console.log('All methods failed, falling back to demo mode. Errors:', {
            correctPassError: correctPassError instanceof Error ? correctPassError.message : String(correctPassError),
            altPassError: altPassError instanceof Error ? altPassError.message : String(altPassError),
            fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
          });
          
          // Last resort: demo response with proper URL
          const demoData = await generateDemoPass(passData);
          
          return NextResponse.json({
            ...demoData,
            url: `/api/wallet/${token}`,
            note: 'Demo mode - certificates not available in production'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error creating pass:', error);
    return NextResponse.json(
      { error: 'Failed to create pass' },
      { status: 500 }
    );
  }
}
