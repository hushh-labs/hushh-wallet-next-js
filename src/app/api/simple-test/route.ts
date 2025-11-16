import { NextRequest, NextResponse } from 'next/server';
import { PKPass } from 'passkit-generator';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Simple PKPass Test Started');
    
    const projectRoot = process.cwd();
    
    // Load certificates
    const signerCert = fs.readFileSync(path.join(projectRoot, 'signerCert.pem'), 'utf8');
    const signerKey = fs.readFileSync(path.join(projectRoot, 'signerKey.pem'), 'utf8');
    const wwdr = fs.readFileSync(path.join(projectRoot, 'wwdr.pem'), 'utf8');
    
    // Create a simple in-memory pass structure
    const simplePassData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.hushh.wallet",
      teamIdentifier: "WVDK9JW99C", 
      serialNumber: `SIMPLE-${Date.now()}`,
      organizationName: "HushOne, Inc.",
      description: "Simple Hushh Test Pass",
      logoText: "HUSHH TEST",
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(0, 0, 0)",
      generic: {
        primaryFields: [
          {
            key: "name",
            label: "Name", 
            value: "Test User"
          }
        ],
        secondaryFields: [],
        auxiliaryFields: [],
        backFields: []
      }
    };
    
    // Create temporary directory and files (must have .pass extension)
    const tempDir = path.join(projectRoot, 'temp-pass.pass');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Write pass.json 
    fs.writeFileSync(
      path.join(tempDir, 'pass.json'), 
      JSON.stringify(simplePassData, null, 2)
    );
    
    // Copy required icon files (create minimal ones if needed)
    const iconPath = path.join(tempDir, 'icon.png');
    const logoPath = path.join(tempDir, 'logo.png');
    
    // Copy from personal.pass if available
    const personalIconPath = path.join(projectRoot, 'passModels', 'personal.pass', 'icon.png');
    if (fs.existsSync(personalIconPath)) {
      fs.copyFileSync(personalIconPath, iconPath);
      fs.copyFileSync(path.join(projectRoot, 'passModels', 'personal.pass', 'logo.png'), logoPath);
    }
    
    // Create PKPass from temporary model
    console.log('Creating pass from temp directory...');
    const pass = await PKPass.from({
      model: tempDir,
      certificates: {
        wwdr,
        signerCert, 
        signerKey,
        signerKeyPassphrase: undefined
      }
    });
    
    console.log('Pass created, attempting buffer generation...');
    const buffer = pass.getAsBuffer();
    
    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    return NextResponse.json({
      success: true,
      message: 'Simple PKPass test successful!',
      bufferSize: buffer.length,
      passData: {
        serialNumber: pass.props.serialNumber,
        description: pass.props.description,
        organizationName: pass.props.organizationName
      }
    });
    
  } catch (error) {
    console.error('❌ Simple PKPass test failed:', error);
    
    // Cleanup on error
    const tempDir = path.join(process.cwd(), 'temp-pass.pass');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Simple PKPass test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
