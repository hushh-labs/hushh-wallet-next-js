import { PKPass } from 'passkit-generator';
import * as fs from 'fs';
import * as path from 'path';

interface PersonalPassData {
  preferredName: string;
  legalName: string;
  age: number;
  gender?: string;
  phone: string;
  maskedPhone: string;
  dob: string;
  issueDate: string;
}

export async function generatePersonalAppleWalletPass(passData: PersonalPassData): Promise<Buffer> {
  try {
    const projectRoot = process.cwd();
    
    // Read the properly extracted PEM certificates - same as working food card
    const signerCert = fs.readFileSync(path.join(projectRoot, 'signerCert.pem'), 'utf8');
    const signerKey = fs.readFileSync(path.join(projectRoot, 'signerKey.pem'), 'utf8');
    const wwdr = fs.readFileSync(path.join(projectRoot, 'wwdr.pem'), 'utf8');

    console.log('Certificates loaded successfully for Personal Pass');

    // Use the SAME working model as food preference card (luxury.pass)
    const pass = await PKPass.from({
      model: path.join(projectRoot, 'passModels', 'luxury.pass'),
      certificates: {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase: undefined // Use undefined for unencrypted keys
      }
    }, {
      // Override pass.json data with personal information
      serialNumber: `HUSHH-PERSONAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: `${passData.preferredName}'s Personal Data Card`
    });

    const serialNumber = `HUSHH-PERSONAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add personal fields using the proper passkit-generator API
    pass.primaryFields.push({
      key: 'preferredName',
      label: 'Name',
      value: passData.preferredName
    });

    pass.secondaryFields.push({
      key: 'age',
      label: 'Age',
      value: `${passData.age} years old`
    });

    // Add auxiliary fields
    pass.auxiliaryFields.push({
      key: 'issued',
      label: 'Issued',
      value: new Date(passData.issueDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    });

    // Add back fields with full information
    pass.backFields.push(
      {
        key: 'fullName',
        label: 'Legal Name',
        value: passData.legalName
      },
      {
        key: 'contact',
        label: 'Phone',
        value: passData.maskedPhone
      },
      {
        key: 'birthDate',
        label: 'Date of Birth',
        value: new Date(passData.dob).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      },
      {
        key: 'cardInfo',
        label: 'About This Card',
        value: 'Your personal identity card for convenient, privacy-focused identification. Show this card when personal details are needed.'
      },
      {
        key: 'privacy',
        label: 'Privacy Notice',
        value: 'Your personal information is stored securely and only essential details are shown on the card face. Full details remain private on the back.'
      },
      {
        key: 'support',
        label: 'Support',
        value: `Visit hushh.ai for help • Card ID: ${serialNumber.slice(-8)}`
      }
    );

    console.log('Personal PKPass created successfully using PKPass.from()');

    // Generate the pass buffer
    const passBuffer = pass.getAsBuffer();
    console.log('Personal pass buffer generated, size:', passBuffer.length);
    
    return passBuffer;
    
  } catch (error) {
    console.error('Error generating personal Apple Wallet pass:', error);
    throw error;
  }
}

async function generatePersonalPassWithCustomTemplate(passData: PersonalPassData): Promise<Buffer> {
  // This will be the full implementation using passkit-generator or similar
  // For now, we'll create a structured approach that can be easily implemented
  
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: "pass.com.hushh.personal",
    teamIdentifier: "WVDK9JW99C",
    organizationName: "HushOne, Inc.",
    description: "Hushh Personal Data Card",
    serialNumber: generateSerialNumber(),
    logoText: "Hushh",
    foregroundColor: "rgb(255, 250, 245)",
    backgroundColor: "rgb(26, 26, 26)", // Darker for personal card
    labelColor: "rgb(180, 175, 170)",
    generic: {
      primaryFields: [
        {
          key: "preferredName",
          label: "Name",
          value: passData.preferredName
        }
      ],
      secondaryFields: [
        {
          key: "age",
          label: "Age",
          value: `${passData.age} years old`
        }
      ],
      auxiliaryFields: [
        ...(passData.gender && passData.gender !== 'prefer_not_to_say' ? [{
          key: "gender",
          label: "Gender",
          value: passData.gender.charAt(0).toUpperCase() + passData.gender.slice(1).replace('_', ' ')
        }] : []),
        {
          key: "issued",
          label: "Issued",
          value: new Date(passData.issueDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })
        }
      ],
      backFields: [
        {
          key: "fullName",
          label: "Legal Name",
          value: passData.legalName
        },
        {
          key: "contact",
          label: "Phone",
          value: passData.maskedPhone
        },
        {
          key: "birthDate",
          label: "Date of Birth",
          value: new Date(passData.dob).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        },
        {
          key: "cardInfo",
          label: "About This Card",
          value: "Your personal identity card for convenient, privacy-focused identification. Show this card when personal details are needed."
        },
        {
          key: "privacy",
          label: "Privacy Notice",
          value: "Your personal information is stored securely and only essential details are shown on the card face. Full details remain private on the back."
        },
        {
          key: "support",
          label: "Support",
          value: "Visit hushh.ai for help • Card ID: " + generateSerialNumber().slice(-8)
        }
      ]
    }
  };

  // For now, return a JSON representation as we did with the food card
  // In production, this would use proper certificate signing
  const demoPassContent = {
    message: "Personal Data Card - Demo Mode",
    note: "This is a demonstration. In production, this would be a properly signed .pkpass file.",
    passData: passJson,
    instructions: "To implement full Apple Wallet integration, set up proper certificate signing in a server environment.",
    timestamp: new Date().toISOString(),
    cardType: "PERSONAL"
  };

  // Convert to buffer for consistency with other generators
  const jsonString = JSON.stringify(demoPassContent, null, 2);
  return Buffer.from(jsonString, 'utf-8');
}

function generateSerialNumber(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `H-PERSONAL-${timestamp}${randomStr}`.toUpperCase();
}

// Demo function for testing
export function generatePersonalDemoPass(passData: PersonalPassData): any {
  return {
    message: "Demo Personal Data Card",
    passData: passData,
    serialNumber: generateSerialNumber(),
    note: "This is a demo. In production, this would generate a proper .pkpass file.",
    timestamp: new Date().toISOString()
  };
}
