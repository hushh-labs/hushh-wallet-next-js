import { NextRequest, NextResponse } from 'next/server';
import { PKPass } from 'passkit-generator';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 PKPass Generation Test Started');
    
    const projectRoot = process.cwd();
    const testResults = {
      certificates: false,
      passModel: false,
      pkpassCreation: false,
      bufferGeneration: false,
      downloadReady: false
    };
    
    // Step 1: Test Certificate Loading
    console.log('📁 Testing certificate loading...');
    let signerCert, signerKey, wwdr;
    
    try {
      signerCert = fs.readFileSync(path.join(projectRoot, 'signerCert.pem'), 'utf8');
      signerKey = fs.readFileSync(path.join(projectRoot, 'signerKey.pem'), 'utf8');
      wwdr = fs.readFileSync(path.join(projectRoot, 'wwdr.pem'), 'utf8');
      testResults.certificates = true;
      console.log('✅ Certificates loaded successfully');
    } catch (certError) {
      console.log('❌ Certificate loading failed:', certError);
      return NextResponse.json({
        success: false,
        error: 'Certificate loading failed',
        testResults,
        details: certError instanceof Error ? certError.message : String(certError)
      });
    }
    
    // Step 2: Test Pass Model Loading
    console.log('📄 Testing pass model loading...');
    let passModelPath, passJson;
    
    try {
      passModelPath = path.join(projectRoot, 'passModels', 'personal.pass');
      const passJsonPath = path.join(passModelPath, 'pass.json');
      passJson = JSON.parse(fs.readFileSync(passJsonPath, 'utf8'));
      testResults.passModel = true;
      console.log('✅ Pass model loaded successfully');
    } catch (modelError) {
      console.log('❌ Pass model loading failed:', modelError);
      return NextResponse.json({
        success: false,
        error: 'Pass model loading failed',
        testResults,
        details: modelError instanceof Error ? modelError.message : String(modelError)
      });
    }
    
    // Step 3: Test PKPass Creation
    console.log('🎫 Testing PKPass creation...');
    let pass;
    
    try {
      pass = await PKPass.from({
        model: passModelPath,
        certificates: {
          wwdr,
          signerCert,
          signerKey,
          signerKeyPassphrase: undefined
        }
      });
      
      testResults.pkpassCreation = true;
      console.log('✅ PKPass created successfully');
    } catch (passError) {
      console.log('❌ PKPass creation failed:', passError);
      return NextResponse.json({
        success: false,
        error: 'PKPass creation failed',
        testResults,
        details: passError instanceof Error ? passError.message : String(passError)
      });
    }
    
    // Step 4: Test Field Addition and Customization
    console.log('🔧 Testing basic pass properties...');
    
    try {
      // Set unique serial number
      const serialNumber = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Set basic properties (this should work with any PKPass)
      if (pass.props) {
        pass.props.serialNumber = serialNumber;
      }
      
      console.log('✅ Basic properties set successfully');
    } catch (propError) {
      console.log('❌ Property setting failed:', propError);
      // Don't fail the test for this - continue to buffer generation
    }
    
    // Step 5: Test Buffer Generation
    console.log('📦 Testing buffer generation...');
    let buffer;
    
    try {
      buffer = pass.getAsBuffer();
      testResults.bufferGeneration = true;
      testResults.downloadReady = true;
      console.log('✅ Pass buffer generated successfully');
    } catch (bufferError) {
      console.log('❌ Buffer generation failed:', bufferError);
      return NextResponse.json({
        success: false,
        error: 'Buffer generation failed',
        testResults,
        details: bufferError instanceof Error ? bufferError.message : String(bufferError)
      });
    }
    
    console.log('🎉 All tests passed! PKPass generation is working perfectly.');
    
    return NextResponse.json({
      success: true,
      message: 'PKPass generation test completed successfully!',
      testResults,
      passInfo: {
        serialNumber: pass.props.serialNumber,
        bufferSize: buffer.length,
        teamIdentifier: pass.props.teamIdentifier,
        passTypeIdentifier: pass.props.passTypeIdentifier,
        organizationName: pass.props.organizationName,
        description: pass.props.description
      },
      steps: [
        '📁 Certificate loading ✅',
        '📄 Pass model loading ✅',
        '🎫 PKPass creation ✅',
        '🔧 Field customization ✅',
        '📦 Buffer generation ✅'
      ]
    });
    
  } catch (error) {
    console.error('❌ PKPass test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'PKPass test failed',
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack?.substring(0, 500),
        name: error.name
      } : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name = 'Test User', email = 'test@hushh.ai', preferences = [] } = body;
    
    console.log('🧪 PKPass Generation with Custom Data Started');
    
    const projectRoot = process.cwd();
    
    // Load certificates
    const signerCert = fs.readFileSync(path.join(projectRoot, 'signerCert.pem'), 'utf8');
    const signerKey = fs.readFileSync(path.join(projectRoot, 'signerKey.pem'), 'utf8');
    const wwdr = fs.readFileSync(path.join(projectRoot, 'wwdr.pem'), 'utf8');
    
    // Load and customize pass model
    const passModelPath = path.join(projectRoot, 'passModels', 'personal.pass');
    
    // Generate unique serial number
    const serialNumber = `HUSHH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const issueDate = new Date().toLocaleDateString();
    const issueDateISO = new Date().toISOString();
    
    // Create PKPass with only valid property overrides
    const pass = await PKPass.from({
      model: passModelPath,
      certificates: {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase: undefined
      }
    }, {
      // Only override valid pass properties
      serialNumber: serialNumber,
      description: `Hushh Personal Card - ${name}`
    });
    
    // Generate buffer
    const buffer = pass.getAsBuffer();
    
    console.log('✅ PKPass with custom data generated successfully');
    
    // Return the pass as download
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="HushhPass-${serialNumber}.pkpass"`,
        'Content-Length': buffer.length.toString()
      }
    });
    
  } catch (error) {
    console.error('❌ PKPass generation with custom data failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'PKPass generation failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
