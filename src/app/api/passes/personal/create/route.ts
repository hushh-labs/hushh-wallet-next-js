import { NextRequest, NextResponse } from 'next/server';
import { PersonalPayload } from '@/types';
import { generatePersonalAppleWalletPass } from '@/lib/personalPassGenerator';

export async function POST(request: NextRequest) {
  const requestStart = Date.now();
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  console.log(`🚀 [API-${requestId}] Starting personal pass creation request`);
  console.log(`📥 [API-${requestId}] Request method:`, request.method);
  console.log(`📍 [API-${requestId}] Request URL:`, request.url);
  console.log(`📋 [API-${requestId}] Request headers:`, Object.fromEntries(request.headers.entries()));
  
  try {
    console.log(`📖 [API-${requestId}] Parsing request body...`);
    const body = await request.json() as PersonalPayload;
    console.log(`✅ [API-${requestId}] Body parsed successfully`);
    console.log(`📊 [API-${requestId}] Request data:`, JSON.stringify(body, null, 2));
    
    // Validate the PersonalPayload
    console.log(`🔍 [API-${requestId}] Validating required fields...`);
    console.log(`🔍 [API-${requestId}] preferredName: '${body.preferredName}' (${typeof body.preferredName})`);
    console.log(`🔍 [API-${requestId}] legalName: '${body.legalName}' (${typeof body.legalName})`);
    console.log(`🔍 [API-${requestId}] phone: '${body.phone}' (${typeof body.phone})`);
    console.log(`🔍 [API-${requestId}] dob: '${body.dob}' (${typeof body.dob})`);
    
    if (!body.preferredName || !body.legalName || !body.phone || !body.dob) {
      console.error(`❌ [API-${requestId}] Validation failed - missing required fields`);
      return NextResponse.json({ 
        error: 'Required fields missing: preferredName, legalName, phone, and dob are required' 
      }, { status: 400 });
    }
    console.log(`✅ [API-${requestId}] All required fields present`);

    // Validate phone format
    console.log(`📱 [API-${requestId}] Validating phone format...`);
    const phoneRegex = /^\+[1-9]\d{8,14}$/;
    const phoneValid = phoneRegex.test(body.phone);
    console.log(`📱 [API-${requestId}] Phone regex test result:`, phoneValid);
    
    if (!phoneValid) {
      console.error(`❌ [API-${requestId}] Phone validation failed for: '${body.phone}'`);
      return NextResponse.json({ 
        error: 'Invalid phone number format. Use E.164 format (e.g., +91xxxxxxxxxx)' 
      }, { status: 400 });
    }
    console.log(`✅ [API-${requestId}] Phone format valid`);

    // Validate date of birth
    console.log(`📅 [API-${requestId}] Validating date of birth...`);
    console.log(`📅 [API-${requestId}] Raw DOB from request: '${body.dob}' (${typeof body.dob})`);
    const birthDate = new Date(body.dob);
    console.log(`📅 [API-${requestId}] Parsed birthDate:`, birthDate);
    console.log(`📅 [API-${requestId}] Date valid:`, !isNaN(birthDate.getTime()));
    
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    console.log(`📅 [API-${requestId}] Calculated age:`, age);
    console.log(`📅 [API-${requestId}] Today:`, today);
    console.log(`📅 [API-${requestId}] Birth in future:`, birthDate > today);
    
    if (isNaN(birthDate.getTime()) || age < 1 || age > 120 || birthDate > today) {
      console.error(`❌ [API-${requestId}] Date validation failed:`, {
        isNaN: isNaN(birthDate.getTime()),
        age,
        birthDate,
        today,
        futureDate: birthDate > today
      });
      return NextResponse.json({ 
        error: `Invalid date of birth. Received: ${body.dob}, Parsed: ${birthDate}` 
      }, { status: 400 });
    }
    console.log(`✅ [API-${requestId}] Date validation passed`);

    // Calculate age for card display
    console.log(`🧮 [API-${requestId}] Calculating precise age...`);
    const calculatedAge = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    console.log(`🧮 [API-${requestId}] Precise age calculated:`, calculatedAge);
    
    // Mask phone number for privacy
    console.log(`🎭 [API-${requestId}] Masking phone number...`);
    const maskedPhone = body.phone.replace(/(\+\d{1,3})\d+(\d{4})/, '$1•••••$2');
    console.log(`🎭 [API-${requestId}] Phone masked: '${body.phone}' -> '${maskedPhone}'`);

    // Prepare pass data
    console.log(`📋 [API-${requestId}] Preparing pass data structure...`);
    const issueDate = new Date().toISOString();
    const passData = {
      preferredName: body.preferredName,
      legalName: body.legalName,
      age: calculatedAge,
      gender: body.gender,
      phone: body.phone,
      maskedPhone: maskedPhone,
      dob: body.dob,
      issueDate: issueDate
    };

    console.log(`📋 [API-${requestId}] Pass data prepared:`, JSON.stringify(passData, null, 2));
    console.log(`🎯 [API-${requestId}] Starting pass generation for: '${body.preferredName}'`);

    try {
      console.log(`🔨 [API-${requestId}] Calling generatePersonalAppleWalletPass...`);
      const passGenerationStart = Date.now();
      
      // Generate the Apple Wallet pass
      const passBuffer = await generatePersonalAppleWalletPass(passData);
      
      const passGenerationTime = Date.now() - passGenerationStart;
      console.log(`✅ [API-${requestId}] Personal card generated successfully in ${passGenerationTime}ms!`);
      console.log(`📦 [API-${requestId}] Pass buffer size:`, passBuffer?.length || 0, 'bytes');
      
      // Generate filename
      console.log(`📝 [API-${requestId}] Generating filename...`);
      const safeName = body.preferredName.replace(/[^a-zA-Z0-9]/g, '');
      const filename = `HushOne-Personal-${safeName}.pkpass`;
      console.log(`📝 [API-${requestId}] Filename: '${filename}'`);
      
      console.log(`📤 [API-${requestId}] Preparing response headers...`);
      const headers = {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
      };
      console.log(`📤 [API-${requestId}] Response headers:`, headers);
      
      const totalTime = Date.now() - requestStart;
      console.log(`🏁 [API-${requestId}] Total request processing time: ${totalTime}ms`);
      
      // Return the actual .pkpass file for download with proper headers for iPhone
      return new NextResponse(passBuffer as any, {
        status: 200,
        headers: headers,
      });
    } catch (passError) {
      const passErrorTime = Date.now() - requestStart;
      console.error(`💥 [API-${requestId}] Pass generation failed after ${passErrorTime}ms:`, passError);
      console.error(`💥 [API-${requestId}] Error message:`, passError instanceof Error ? passError.message : String(passError));
      console.error(`💥 [API-${requestId}] Error stack:`, passError instanceof Error ? passError.stack : 'No stack trace');
      console.error(`💥 [API-${requestId}] Error type:`, passError?.constructor?.name || typeof passError);
      
      // Fallback: return demo data with proper URL
      console.log(`🔄 [API-${requestId}] Falling back to demo mode...`);
      return NextResponse.json({
        message: 'Demo mode - Personal Data Card',
        passData: passData,
        note: 'In production, this would be a .pkpass file for Apple Wallet',
        downloadUrl: '#', // In real implementation, this would be a shareable URL
        error: passError instanceof Error ? passError.message : 'Pass generation failed',
        requestId: requestId,
        processingTime: passErrorTime
      });
    }
  } catch (error) {
    const totalErrorTime = Date.now() - requestStart;
    console.error(`💥 [API-${requestId}] Critical error in personal card creation after ${totalErrorTime}ms:`, error);
    console.error(`💥 [API-${requestId}] Error message:`, error instanceof Error ? error.message : String(error));
    console.error(`💥 [API-${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    console.error(`💥 [API-${requestId}] Error type:`, error?.constructor?.name || typeof error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create personal data card',
        details: error instanceof Error ? error.message : String(error),
        requestId: requestId,
        processingTime: totalErrorTime
      },
      { status: 500 }
    );
  }
}
