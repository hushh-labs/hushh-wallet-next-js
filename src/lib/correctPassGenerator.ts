import { PKPass } from 'passkit-generator';
import * as fs from 'fs';
import * as path from 'path';

export interface PassData {
  name: string;
  preferences: string[];
  email?: string;
}

export async function generateCorrectAppleWalletPass(passData: PassData): Promise<Buffer> {
  const startTime = Date.now();
  console.log('🚀 [CorrectPass] Starting pass generation process');
  console.log('📊 [CorrectPass] Input data:', JSON.stringify(passData, null, 2));
  
  try {
    const projectRoot = process.cwd();
    console.log('📁 [CorrectPass] Project root:', projectRoot);

    // Check certificate file existence
    const signerCertPath = path.join(projectRoot, 'signerCert.pem');
    const signerKeyPath = path.join(projectRoot, 'signerKey.pem');
    const wwdrPath = path.join(projectRoot, 'wwdr.pem');

    console.log('🔍 [CorrectPass] Checking certificate files:');
    console.log('  - signerCert.pem:', fs.existsSync(signerCertPath) ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - signerKey.pem:', fs.existsSync(signerKeyPath) ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - wwdr.pem:', fs.existsSync(wwdrPath) ? '✅ EXISTS' : '❌ MISSING');
    
    // Read the properly extracted PEM certificates
    console.log('📖 [CorrectPass] Reading certificate files...');
    const signerCert = fs.readFileSync(signerCertPath, 'utf8');
    console.log('✅ [CorrectPass] signerCert loaded, length:', signerCert.length);
    
    const signerKey = fs.readFileSync(signerKeyPath, 'utf8');
    console.log('✅ [CorrectPass] signerKey loaded, length:', signerKey.length);
    
    const wwdr = fs.readFileSync(wwdrPath, 'utf8');
    console.log('✅ [CorrectPass] wwdr loaded, length:', wwdr.length);

    console.log('🎫 [CorrectPass] Certificates loaded successfully');

    const serialNumber = `HUSHH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆔 [CorrectPass] Generated serial number:', serialNumber);

    // Check pass model directory
    const modelPath = path.join(projectRoot, 'passModels', 'luxury.pass');
    console.log('📁 [CorrectPass] Pass model path:', modelPath);
    console.log('📁 [CorrectPass] Pass model exists:', fs.existsSync(modelPath) ? '✅ YES' : '❌ NO');
    
    if (fs.existsSync(modelPath)) {
      const modelFiles = fs.readdirSync(modelPath);
      console.log('📋 [CorrectPass] Pass model files:', modelFiles);
    }

    console.log('🔨 [CorrectPass] Creating PKPass instance...');
    
    // Use PKPass.from() with the model directory - this is the correct approach
    const passConfig = {
      model: modelPath,
      certificates: {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase: undefined // Use undefined for unencrypted keys
      }
    };
    
    const passOverrides = {
      // Override pass.json data with user preferences
      serialNumber: serialNumber,
      description: `${passData.name}'s Taste Card`
    };
    
    console.log('⚙️ [CorrectPass] Pass config:', JSON.stringify(passConfig, null, 2));
    console.log('🎨 [CorrectPass] Pass overrides:', JSON.stringify(passOverrides, null, 2));
    
    const pass = await PKPass.from(passConfig, passOverrides);
    console.log('✅ [CorrectPass] PKPass instance created successfully');

    console.log('🏷️ [CorrectPass] Adding pass fields...');
    
    // Add fields using the proper passkit-generator API
    const primaryField = {
      key: 'name',
      label: 'Name',
      value: passData.name
    };
    console.log('📝 [CorrectPass] Adding primary field:', primaryField);
    pass.primaryFields.push(primaryField);

    const secondaryField = {
      key: 'preferences',
      label: 'Taste Preferences', 
      value: passData.preferences.join(', ')
    };
    console.log('📝 [CorrectPass] Adding secondary field:', secondaryField);
    pass.secondaryFields.push(secondaryField);

    const auxiliaryField = {
      key: 'member',
      label: 'Member Since',
      value: new Date().toLocaleDateString()
    };
    console.log('📝 [CorrectPass] Adding auxiliary field:', auxiliaryField);
    pass.auxiliaryFields.push(auxiliaryField);

    console.log('✅ [CorrectPass] All fields added successfully');
    console.log('🎯 [CorrectPass] PKPass configured successfully');

    console.log('🔄 [CorrectPass] Generating pass buffer...');
    // Generate the pass buffer
    const passBuffer = pass.getAsBuffer();
    console.log('✅ [CorrectPass] Pass buffer generated successfully');
    console.log('📦 [CorrectPass] Buffer size:', passBuffer.length, 'bytes');
    console.log('⏱️ [CorrectPass] Total generation time:', Date.now() - startTime, 'ms');
    
    return passBuffer;
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('💥 [CorrectPass] Error during pass generation:');
    console.error('💥 [CorrectPass] Error message:', error instanceof Error ? error.message : String(error));
    console.error('💥 [CorrectPass] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('💥 [CorrectPass] Error type:', error?.constructor?.name || typeof error);
    console.error('💥 [CorrectPass] Failed after:', errorTime, 'ms');
    
    // Additional error context would be logged here if available
    
    throw error;
  }
}
