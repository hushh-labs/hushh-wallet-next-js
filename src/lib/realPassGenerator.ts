import { PKPass } from 'passkit-generator';
import * as fs from 'fs';
import * as path from 'path';

export interface PassData {
  name: string;
  preferences: string[];
  email?: string;
}

export async function generateRealAppleWalletPass(passData: PassData): Promise<Buffer> {
  try {
    // Read certificates from the project directory
    const projectRoot = process.cwd();
    const certPath = path.join(projectRoot, 'hushhwalletintegeration.p12');
    const caCertPath = path.join(projectRoot, 'Apple Worldwide Developer Relations Certification Authority.cer');
    
    console.log('Reading certificates from:', { certPath, caCertPath });
    
    // Read the certificates
    const signerCert = fs.readFileSync(certPath);
    const caCert = fs.readFileSync(caCertPath);

    console.log('Successfully loaded certificates');

    // Create pass model files from our luxury pass
    const passModelPath = path.join(projectRoot, 'passModels', 'luxury.pass');
    
    // Read pass.json and modify it with user data
    const passJsonPath = path.join(passModelPath, 'pass.json');
    const passJsonContent = JSON.parse(fs.readFileSync(passJsonPath, 'utf8'));
    
    // Modify pass.json with user preferences
    const serialNumber = `HUSHH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const updatedPassJson = {
      ...passJsonContent,
      serialNumber,
      description: `${passData.name}'s Taste Card`,
      storeCard: {
        primaryFields: [
          {
            key: 'name',
            label: 'Name',
            value: passData.name
          }
        ],
        secondaryFields: [
          {
            key: 'preferences',
            label: 'Taste Preferences', 
            value: passData.preferences.join(', ')
          }
        ],
        auxiliaryFields: [
          {
            key: 'member',
            label: 'Member Since',
            value: new Date().toLocaleDateString()
          }
        ]
      }
    };

    // Create file buffers for pass creation
    const passFiles = {
      'pass.json': Buffer.from(JSON.stringify(updatedPassJson)),
      'icon.png': fs.readFileSync(path.join(passModelPath, 'icon.png')),
      'icon@2x.png': fs.readFileSync(path.join(passModelPath, 'icon@2x.png')),
      'logo.png': fs.readFileSync(path.join(passModelPath, 'logo.png')),
      'logo@2x.png': fs.readFileSync(path.join(passModelPath, 'logo@2x.png'))
    };

    // Create the pass using PKPass
    const pass = new PKPass(
      passFiles,
      {
        signerCert,
        signerKey: signerCert, // For .p12 files, key and cert are the same
        wwdr: caCert,
        signerKeyPassphrase: '' // Adjust if your .p12 has a passphrase
      }
    );

    console.log('PKPass created successfully');

    // Generate the pass buffer
    const passBuffer = pass.getAsBuffer();
    console.log('Pass buffer generated, size:', passBuffer.length);
    
    return passBuffer;
    
  } catch (error) {
    console.error('Error generating real Apple Wallet pass:', error);
    throw error;
  }
}
