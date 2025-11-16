import { PKPass } from 'passkit-generator';
import * as fs from 'fs';
import * as path from 'path';

export interface PassData {
  name: string;
  preferences: string[];
  email?: string;
}

export async function generateCorrectAppleWalletPass(passData: PassData): Promise<Buffer> {
  try {
    const projectRoot = process.cwd();
    
    // Read the properly extracted PEM certificates
    const signerCert = fs.readFileSync(path.join(projectRoot, 'signerCert.pem'), 'utf8');
    const signerKey = fs.readFileSync(path.join(projectRoot, 'signerKey.pem'), 'utf8');
    const wwdr = fs.readFileSync(path.join(projectRoot, 'wwdr.pem'), 'utf8');

    console.log('Certificates loaded successfully');

    // Use PKPass.from() with the model directory - this is the correct approach
    const pass = await PKPass.from({
      model: path.join(projectRoot, 'passModels', 'luxury.pass'),
      certificates: {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase: undefined // Use undefined for unencrypted keys
      }
    }, {
      // Override pass.json data with user preferences
      serialNumber: `HUSHH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: `${passData.name}'s Taste Card`
    });

    // Add fields using the proper passkit-generator API
    pass.primaryFields.push({
      key: 'name',
      label: 'Name',
      value: passData.name
    });

    pass.secondaryFields.push({
      key: 'preferences',
      label: 'Taste Preferences', 
      value: passData.preferences.join(', ')
    });

    pass.auxiliaryFields.push({
      key: 'member',
      label: 'Member Since',
      value: new Date().toLocaleDateString()
    });

    console.log('PKPass created successfully using PKPass.from()');

    // Generate the pass buffer
    const passBuffer = pass.getAsBuffer();
    console.log('Pass buffer generated, size:', passBuffer.length);
    
    return passBuffer;
    
  } catch (error) {
    console.error('Error generating correct Apple Wallet pass:', error);
    throw error;
  }
}
