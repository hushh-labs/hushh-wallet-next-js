import { NextRequest, NextResponse } from 'next/server';
import { PKPass } from 'passkit-generator';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const projectRoot = process.cwd();
    
    console.log('Testing different passphrase approaches...');
    
    const signerCert = fs.readFileSync(path.join(projectRoot, 'signerCert.pem'), 'utf8');
    const signerKey = fs.readFileSync(path.join(projectRoot, 'signerKey.pem'), 'utf8');
    const wwdr = fs.readFileSync(path.join(projectRoot, 'wwdr.pem'), 'utf8');
    const passModelPath = path.join(projectRoot, 'passModels', 'luxury.pass');
    
    // Test different passphrase approaches
    const passphraseTests = [
      { name: 'Empty string', passphrase: '' },
      { name: 'Undefined', passphrase: undefined },
      { name: 'Null', passphrase: null },
      { name: 'Space', passphrase: ' ' },
      { name: 'Default', passphrase: 'password' },
      { name: 'None (omitted)', passphrase: 'OMIT' }
    ];
    
    const results = [];
    
    for (const test of passphraseTests) {
      try {
        console.log(`Testing: ${test.name}`);
        
        const certificateConfig: any = {
          wwdr,
          signerCert,
          signerKey
        };
        
        // Add passphrase conditionally
        if (test.passphrase !== 'OMIT') {
          certificateConfig.signerKeyPassphrase = test.passphrase;
        }
        
        const pass = await PKPass.from({
          model: passModelPath,
          certificates: certificateConfig
        });
        
        // If we get here, it worked!
        const buffer = pass.getAsBuffer();
        
        results.push({
          test: test.name,
          success: true,
          bufferSize: buffer.length,
          error: null
        });
        
        console.log(`✅ SUCCESS with ${test.name}: Buffer size ${buffer.length}`);
        break; // Stop on first success
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.push({
          test: test.name,
          success: false,
          bufferSize: null,
          error: errorMsg
        });
        
        console.log(`❌ FAILED with ${test.name}: ${errorMsg}`);
      }
    }
    
    return NextResponse.json({
      message: 'Passphrase testing completed',
      results,
      recommendation: results.find(r => r.success) ? 
        `Use: ${results.find(r => r.success)?.test}` : 
        'No working passphrase found'
    });
    
  } catch (error) {
    console.error('Test failed:', error);
    
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
