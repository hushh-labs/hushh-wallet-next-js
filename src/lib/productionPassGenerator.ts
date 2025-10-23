import { PKPass } from 'passkit-generator';
import * as fs from 'fs';
import * as path from 'path';

export interface PassData {
  name: string;
  preferences: string[];
  email?: string;
}

export async function generateAppleWalletPass(passData: PassData): Promise<Buffer> {
  try {
    // For production, we need to handle certificate loading properly
    // In serverless environment like Vercel, we'd typically store these as base64 env vars
    
    // Check if running in production environment
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // In production, certificates would be stored as environment variables
      // For now, we'll return a demo response since we don't have the actual certificates deployed
      throw new Error('Production certificate handling not yet implemented');
    }
    
    // For local development
    const certPath = path.join(process.cwd(), '..', 'hushhwalletintegeration.p12');
    const caCertPath = path.join(process.cwd(), '..', 'Apple Worldwide Developer Relations Certification Authority.cer');
    
    // Check if certificates exist
    if (!fs.existsSync(certPath) || !fs.existsSync(caCertPath)) {
      throw new Error('Certificates not found in local environment');
    }
    
    // Load certificates
    const signerCert = fs.readFileSync(certPath);
    const caCert = fs.readFileSync(caCertPath);
    
    // Load pass model files
    const passModelPath = path.join(process.cwd(), 'passModels', 'luxury.pass');
    const passJson = fs.readFileSync(path.join(passModelPath, 'pass.json'));
    const icon = fs.readFileSync(path.join(passModelPath, 'icon.png'));
    const icon2x = fs.readFileSync(path.join(passModelPath, 'icon@2x.png'));
    const logo = fs.readFileSync(path.join(passModelPath, 'logo.png'));
    const logo2x = fs.readFileSync(path.join(passModelPath, 'logo@2x.png'));
    
    // Create file buffers object
    const passFiles = {
      'pass.json': passJson,
      'icon.png': icon,
      'icon@2x.png': icon2x,
      'logo.png': logo,
      'logo@2x.png': logo2x
    };
    
    // Create the pass
    const pass = new PKPass(
      passFiles,
      {
        signerCert,
        signerKey: signerCert, // For .p12 files, key and cert are the same
        wwdr: caCert,
        signerKeyPassphrase: '', // Add passphrase if your .p12 file has one
      }
    );
    
    // Customize the pass with user data
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
    
    // Set unique serial number using pass properties
    const serialNumber = `HUSHH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    pass.props['serialNumber'] = serialNumber;
    
    // Generate the pass
    const buffer = pass.getAsBuffer();
    return buffer;
    
  } catch (error) {
    console.error('Error generating Apple Wallet pass:', error);
    throw error;
  }
}

export async function generateDemoPass(passData: PassData): Promise<any> {
  // Demo response for when actual pass generation isn't available
  return {
    success: true,
    message: 'Demo mode: Apple Wallet pass would be generated here',
    passData: {
      serialNumber: `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: passData.name,
      preferences: passData.preferences,
      memberSince: new Date().toLocaleDateString(),
      passType: 'HushOne Taste Card',
      instructions: 'In a real deployment, this would trigger a .pkpass file download'
    }
  };
}
