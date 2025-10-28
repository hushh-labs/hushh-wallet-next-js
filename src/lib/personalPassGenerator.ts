import path from 'path';
import fs from 'fs';

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
  // Try to use the existing pass generation infrastructure
  try {
    // Import the existing pass generation functions
    const { generateCorrectAppleWalletPass } = await import('./correctPassGenerator');
    
    console.log('Attempting to generate Personal Data Card pass...');
    
    // Create pass data in the format expected by the existing generator
    const personalPassStructure = {
      name: passData.preferredName,
      preferences: [], // Personal cards don't have preferences like food cards
      personalData: passData
    };

    // Use the existing infrastructure but we'll need to customize it for personal data
    return await generatePersonalPassWithCustomTemplate(passData);
    
  } catch (error) {
    console.log('Could not use existing pass generator, trying fallback approach:', error);
    throw new Error('Personal pass generation not yet fully implemented');
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
