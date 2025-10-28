import { NextRequest, NextResponse } from 'next/server';
import { PersonalPayload } from '@/types';
import { generatePersonalAppleWalletPass } from '@/lib/personalPassGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PersonalPayload;
    
    // Validate the PersonalPayload
    if (!body.preferredName || !body.legalName || !body.phone || !body.dob) {
      return NextResponse.json({ 
        error: 'Required fields missing: preferredName, legalName, phone, and dob are required' 
      }, { status: 400 });
    }

    // Validate phone format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(body.phone)) {
      return NextResponse.json({ 
        error: 'Invalid phone number format. Use E.164 format (e.g., +91xxxxxxxxxx)' 
      }, { status: 400 });
    }

    // Validate date of birth
    const birthDate = new Date(body.dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 1 || age > 120 || birthDate > today) {
      return NextResponse.json({ 
        error: 'Invalid date of birth' 
      }, { status: 400 });
    }

    // Calculate age for card display
    const calculatedAge = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    // Mask phone number for privacy
    const maskedPhone = body.phone.replace(/(\+\d{1,3})\d+(\d{4})/, '$1•••••$2');

    // Prepare pass data
    const passData = {
      preferredName: body.preferredName,
      legalName: body.legalName,
      age: calculatedAge,
      gender: body.gender,
      phone: body.phone,
      maskedPhone: maskedPhone,
      dob: body.dob,
      issueDate: new Date().toISOString()
    };

    console.log('Generating Personal Data Card for:', body.preferredName);

    try {
      // Generate the Apple Wallet pass
      const passBuffer = await generatePersonalAppleWalletPass(passData);
      
      console.log('Personal card generated successfully!');
      
      // Generate filename
      const safeName = body.preferredName.replace(/[^a-zA-Z0-9]/g, '');
      const filename = `HushOne-Personal-${safeName}.pkpass`;
      
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
        message: 'Demo mode - Personal Data Card',
        passData: passData,
        note: 'In production, this would be a .pkpass file for Apple Wallet',
        downloadUrl: '#', // In real implementation, this would be a shareable URL
        error: passError instanceof Error ? passError.message : 'Pass generation failed'
      });
    }
  } catch (error) {
    console.error('Error creating personal card:', error);
    return NextResponse.json(
      { error: 'Failed to create personal data card' },
      { status: 500 }
    );
  }
}
