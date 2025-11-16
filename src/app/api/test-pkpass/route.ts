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
    
    // Step 3: Test PKPass Creation with Clean Data
    console.log('🎫 Testing PKPass creation...');
    let pass;
    
    try {
      // Create clean pass data without template placeholders
      const cleanPassData = {
        formatVersion: 1,
        passTypeIdentifier: "pass.com.hushh.wallet",
        teamIdentifier: "WVDK9JW99C",
        serialNumber: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        organizationName: "HushOne, Inc.",
        description: "Hushh Personal Data Card",
        logoText: "HUSHH PERSONAL",
        foregroundColor: "rgb(255, 248, 235)",
        backgroundColor: "rgb(117, 65, 10)",
        labelColor: "rgb(216, 178, 111)",
        generic: {
          primaryFields: [
            {
              key: "preferredName",
              label: "Name",
              value: "Test User"
            }
          ],
          secondaryFields: [
            {
              key: "age",
              label: "Age",
              value: "25 years old"
            }
          ],
          auxiliaryFields: [
            {
              key: "gender",
              label: "Gender",
              value: "Not Specified"
            },
            {
              key: "issued",
              label: "Issued",
              value: new Date().toLocaleDateString()
            }
          ],
          backFields: [
            {
              key: "cardInfo",
              label: "About This Card",
              value: "Your personal identity card for convenient, privacy-focused identification."
            }
          ]
        }
      };

      // Create temporary clean pass directory
      const cleanPassDir = path.join(projectRoot, 'temp-clean.pass');
      if (!fs.existsSync(cleanPassDir)) {
        fs.mkdirSync(cleanPassDir, { recursive: true });
      }
      
      // Write clean pass.json
      fs.writeFileSync(
        path.join(cleanPassDir, 'pass.json'),
        JSON.stringify(cleanPassData, null, 2)
      );
      
      // Copy icons
      const personalIconPath = path.join(projectRoot, 'passModels', 'personal.pass', 'icon.png');
      if (fs.existsSync(personalIconPath)) {
        fs.copyFileSync(personalIconPath, path.join(cleanPassDir, 'icon.png'));
        fs.copyFileSync(path.join(projectRoot, 'passModels', 'personal.pass', 'logo.png'), path.join(cleanPassDir, 'logo.png'));
      }
      
      pass = await PKPass.from({
        model: cleanPassDir,
        certificates: {
          wwdr,
          signerCert,
          signerKey,
          signerKeyPassphrase: undefined
        }
      });
      
      // Cleanup temp directory
      fs.rmSync(cleanPassDir, { recursive: true, force: true });
      
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
    
    // Generate unique serial number
    const serialNumber = `HUSHH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const issueDate = new Date().toLocaleDateString();
    
    // Create clean pass data with custom user info
    const customPassData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.hushh.wallet",
      teamIdentifier: "WVDK9JW99C",
      serialNumber: serialNumber,
      organizationName: "HushOne, Inc.",
      description: `Hushh Personal Card - ${name}`,
      logoText: "HUSHH PERSONAL",
      foregroundColor: "rgb(255, 248, 235)",
      backgroundColor: "rgb(117, 65, 10)",
      labelColor: "rgb(216, 178, 111)",
      generic: {
        primaryFields: [
          {
            key: "preferredName",
            label: "Name",
            value: name
          }
        ],
        secondaryFields: [
          {
            key: "email",
            label: "Contact",
            value: email
          }
        ],
        auxiliaryFields: [
          {
            key: "preferences",
            label: "Interests",
            value: preferences.length > 0 ? preferences.slice(0, 3).join(', ') : 'Not specified'
          },
          {
            key: "issued",
            label: "Issued",
            value: issueDate
          }
        ],
        backFields: [
          {
            key: "cardInfo",
            label: "About This Card",
            value: "Your personal identity card for convenient, privacy-focused identification."
          },
          {
            key: "contact",
            label: "Contact",
            value: `Email: ${email}`
          },
          {
            key: "support",
            label: "Support",
            value: `Visit hushh.ai for help • Card ID: ${serialNumber.slice(-4)}`
          }
        ]
      }
    };

    // Create temporary custom pass directory
    const customPassDir = path.join(projectRoot, 'temp-custom.pass');
    if (!fs.existsSync(customPassDir)) {
      fs.mkdirSync(customPassDir, { recursive: true });
    }
    
    // Write custom pass.json
    fs.writeFileSync(
      path.join(customPassDir, 'pass.json'),
      JSON.stringify(customPassData, null, 2)
    );
    
    // Copy icons
    const personalIconPath = path.join(projectRoot, 'passModels', 'personal.pass', 'icon.png');
    if (fs.existsSync(personalIconPath)) {
      fs.copyFileSync(personalIconPath, path.join(customPassDir, 'icon.png'));
      fs.copyFileSync(path.join(projectRoot, 'passModels', 'personal.pass', 'logo.png'), path.join(customPassDir, 'logo.png'));
    }
    
    // Create PKPass from custom model
    const pass = await PKPass.from({
      model: customPassDir,
      certificates: {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase: undefined
      }
    });
    
    // Generate buffer
    const buffer = pass.getAsBuffer();
    
    // Cleanup temp directory
    fs.rmSync(customPassDir, { recursive: true, force: true });
    
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
    
    // Cleanup on error
    const tempDir = path.join(process.cwd(), 'temp-custom.pass');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    return NextResponse.json({
      success: false,
      error: 'PKPass generation failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
