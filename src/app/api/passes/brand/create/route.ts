import { NextRequest, NextResponse } from 'next/server';
import { BrandPayload } from '@/types';
import { generateBrandAppleWalletPass } from '@/lib/brandPassGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BrandPayload;
    
    // Validate the BrandPayload
    if (!body.styles || body.styles.length === 0) {
      return NextResponse.json({ 
        error: 'Style preferences are required' 
      }, { status: 400 });
    }

    if (!body.budgetBand) {
      return NextResponse.json({ 
        error: 'Budget band is required' 
      }, { status: 400 });
    }

    // Validate styles array (max 2 selections)
    if (body.styles.length > 2) {
      return NextResponse.json({ 
        error: 'Maximum 2 style preferences allowed' 
      }, { status: 400 });
    }

    // Validate favorite brands array (max 3 selections)
    if (body.favBrands && body.favBrands.length > 3) {
      return NextResponse.json({ 
        error: 'Maximum 3 favorite brands allowed' 
      }, { status: 400 });
    }

    // Prepare pass data
    const passData = {
      styles: body.styles,
      favBrands: body.favBrands || [],
      budgetBand: body.budgetBand,
      sizes: body.sizes || {},
      lean: body.lean || {},
      issueDate: new Date().toISOString(),
      stylesSummary: body.styles.join(', '),
      brandsSummary: body.favBrands && body.favBrands.length > 0 
        ? body.favBrands.join(', ') 
        : 'Open to any brands',
      preferencesCount: body.styles.length + (body.favBrands?.length || 0)
    };

    console.log('Generating Brand Preference Card with styles:', body.styles);

    try {
      // Generate the Apple Wallet pass
      const passBuffer = await generateBrandAppleWalletPass(passData);
      
      console.log('Brand card generated successfully!');
      
      // Generate filename
      const styleSlug = body.styles[0].toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      const filename = `HushOne-Brand-${styleSlug}.pkpass`;
      
      // Return the actual .pkpass file for download
      return new NextResponse(passBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } catch (passError) {
      console.log('Pass generation failed, falling back to demo mode:', passError);
      
      // Fallback: return demo data with proper URL
      return NextResponse.json({
        message: 'Demo mode - Brand Preference Card',
        passData: passData,
        note: 'In production, this would be a .pkpass file for Apple Wallet',
        downloadUrl: '#', // In real implementation, this would be a shareable URL
        error: passError instanceof Error ? passError.message : 'Pass generation failed'
      });
    }
  } catch (error) {
    console.error('Error creating brand preference card:', error);
    return NextResponse.json(
      { error: 'Failed to create brand preference card' },
      { status: 500 }
    );
  }
}
