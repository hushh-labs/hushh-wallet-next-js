import { NextRequest, NextResponse } from 'next/server';
import { PKPass } from 'passkit-generator';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const projectRoot = process.cwd();
    
    console.log('Testing passkit-generator step by step...');
    
    // Step 1: Read certificates
    console.log('Step 1: Reading certificates...');
    const signerCert = fs.readFileSync(path.join(projectRoot, 'signerCert.pem'), 'utf8');
    const signerKey = fs.readFileSync(path.join(projectRoot, 'signerKey.pem'), 'utf8');
    const wwdr = fs.readFileSync(path.join(projectRoot, 'wwdr.pem'), 'utf8');
    
    console.log('Certificates read successfully');
    console.log('Signer cert length:', signerCert.length);
    console.log('Signer key length:', signerKey.length);
    console.log('WWDR length:', wwdr.length);
    
    // Step 2: Check pass model
    console.log('Step 2: Checking pass model...');
    const passModelPath = path.join(projectRoot, 'passModels', 'luxury.pass');
    const passJsonPath = path.join(passModelPath, 'pass.json');
    const passJson = JSON.parse(fs.readFileSync(passJsonPath, 'utf8'));
    
    console.log('Pass model found, pass.json:', passJson);
    
    // Step 3: Try to create PKPass instance
    console.log('Step 3: Creating PKPass instance...');
    
    try {
      const pass = await PKPass.from({
        model: passModelPath,
        certificates: {
          wwdr,
          signerCert,
          signerKey,
          signerKeyPassphrase: ''
        }
      });
      
      console.log('PKPass created successfully!');
      
      // Step 4: Try to add fields
      console.log('Step 4: Adding fields...');
      pass.primaryFields.push({
        key: 'name',
        label: 'Test Name',
        value: 'Test User'
      });
      
      console.log('Fields added successfully');
      
      // Step 5: Try to generate buffer
      console.log('Step 5: Generating pass buffer...');
      const buffer = pass.getAsBuffer();
      
      console.log('Pass buffer generated successfully! Size:', buffer.length);
      
      return NextResponse.json({
        success: true,
        message: 'PKPass working perfectly!',
        bufferSize: buffer.length,
        steps: [
          'Certificates read ✅',
          'Pass model loaded ✅', 
          'PKPass created ✅',
          'Fields added ✅',
          'Buffer generated ✅'
        ]
      });
      
    } catch (pkpassError) {
      console.error('PKPass creation failed:', pkpassError);
      
      return NextResponse.json({
        success: false,
        error: 'PKPass creation failed',
        details: pkpassError instanceof Error ? {
          message: pkpassError.message,
          stack: pkpassError.stack,
          name: pkpassError.name
        } : String(pkpassError),
        certificates: {
          signerCertLength: signerCert.length,
          signerKeyLength: signerKey.length,
          wwdrLength: wwdr.length
        },
        passModel: passJson
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : String(error)
    }, { status: 500 });
  }
}
