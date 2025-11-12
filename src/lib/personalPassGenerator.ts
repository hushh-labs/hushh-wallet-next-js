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
  const startTime = Date.now();
  console.log('🚀 [PersonalPass] Starting pass generation process');
  console.log('📊 [PersonalPass] Input data:', JSON.stringify(passData, null, 2));
  
  try {
    const projectRoot = process.cwd();
    console.log('📁 [PersonalPass] Project root:', projectRoot);

    // Check certificate file existence
    const signerCertPath = path.join(projectRoot, 'signerCert.pem');
    const signerKeyPath = path.join(projectRoot, 'signerKey.pem');
    const wwdrPath = path.join(projectRoot, 'wwdr.pem');

    console.log('🔍 [PersonalPass] Checking certificate files:');
    console.log('  - signerCert.pem:', fs.existsSync(signerCertPath) ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - signerKey.pem:', fs.existsSync(signerKeyPath) ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - wwdr.pem:', fs.existsSync(wwdrPath) ? '✅ EXISTS' : '❌ MISSING');

    // Read the properly extracted PEM certificates
    console.log('📖 [PersonalPass] Reading certificate files...');
    const signerCert = fs.readFileSync(signerCertPath, 'utf8');
    console.log('✅ [PersonalPass] signerCert loaded, length:', signerCert.length);
    
    const signerKey = fs.readFileSync(signerKeyPath, 'utf8');
    console.log('✅ [PersonalPass] signerKey loaded, length:', signerKey.length);
    
    const wwdr = fs.readFileSync(wwdrPath, 'utf8');
    console.log('✅ [PersonalPass] wwdr loaded, length:', wwdr.length);

    console.log('🎫 [PersonalPass] Certificates loaded successfully');

    const serialNumber = `HUSHH-PERSONAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆔 [PersonalPass] Generated serial number:', serialNumber);

    // Check pass model directory
    const modelPath = path.join(projectRoot, 'passModels', 'personal.pass');
    console.log('📁 [PersonalPass] Pass model path:', modelPath);
    console.log('📁 [PersonalPass] Pass model exists:', fs.existsSync(modelPath) ? '✅ YES' : '❌ NO');
    
    if (fs.existsSync(modelPath)) {
      const modelFiles = fs.readdirSync(modelPath);
      console.log('📋 [PersonalPass] Pass model files:', modelFiles);
    }

    console.log('🔨 [PersonalPass] Creating PKPass instance...');
    
    // Use the updated personal pass model with golden design
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
      // Override pass.json data with personal information
      serialNumber: serialNumber,
      description: `${passData.preferredName}'s Personal Data Card`,
      // Apply premium golden color scheme
      backgroundColor: 'rgb(117, 65, 10)', // Deep bronze
      foregroundColor: 'rgb(255, 248, 235)', // Warm cream text
      labelColor: 'rgb(216, 178, 111)', // Golden labels
      logoText: 'Hushh Personal'
    };
    
    console.log('⚙️ [PersonalPass] Pass config:', JSON.stringify(passConfig, null, 2));
    console.log('🎨 [PersonalPass] Pass overrides:', JSON.stringify(passOverrides, null, 2));
    
    const pass = await PKPass.from(passConfig, passOverrides);
    console.log('✅ [PersonalPass] PKPass instance created successfully');

    // Set relevant date after pass creation
    console.log('📅 [PersonalPass] Setting relevant date:', passData.issueDate);
    pass.setRelevantDate(new Date(passData.issueDate));
    console.log('✅ [PersonalPass] Relevant date set successfully');

    console.log('🏷️ [PersonalPass] Adding pass fields...');
    
    // Add fields using the proper PKPass methods
    const primaryField = {
      key: 'preferredName',
      label: 'Name',
      value: passData.preferredName
    };
    console.log('📝 [PersonalPass] Adding primary field:', primaryField);
    pass.primaryFields.push(primaryField);

    const secondaryField = {
      key: 'age',
      label: 'Age',
      value: `${passData.age} years old`
    };
    console.log('📝 [PersonalPass] Adding secondary field:', secondaryField);
    pass.secondaryFields.push(secondaryField);

    // Add auxiliary fields
    console.log('📝 [PersonalPass] Adding auxiliary fields...');
    if (passData.gender && passData.gender !== 'prefer_not_to_say') {
      const genderField = {
        key: "gender",
        label: "Gender",
        value: passData.gender.charAt(0).toUpperCase() + passData.gender.slice(1).replace('_', ' ')
      };
      console.log('📝 [PersonalPass] Adding gender field:', genderField);
      pass.auxiliaryFields.push(genderField);
    }

    const issuedField = {
      key: 'issued',
      label: 'Issued',
      value: new Date(passData.issueDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    };
    console.log('📝 [PersonalPass] Adding issued field:', issuedField);
    pass.auxiliaryFields.push(issuedField);

    // Add back fields with full information
    console.log('📝 [PersonalPass] Adding back fields...');
    const backFields = [
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
    ];
    
    console.log('📝 [PersonalPass] Back fields to add:', backFields.length);
    pass.backFields.push(...backFields);
    console.log('✅ [PersonalPass] All back fields added successfully');

    // Add barcode for the pass (use simplified API)
    console.log('📱 [PersonalPass] Setting QR code barcode for serial:', serialNumber);
    pass.setBarcodes(serialNumber);
    console.log('✅ [PersonalPass] Barcode set successfully');

    console.log('🎯 [PersonalPass] PKPass configured successfully');
    console.log('🔄 [PersonalPass] Generating pass buffer...');

    // Generate the pass buffer
    const passBuffer = pass.getAsBuffer();
    console.log('✅ [PersonalPass] Pass buffer generated successfully');
    console.log('� [PersonalPass] Buffer size:', passBuffer.length, 'bytes');
    console.log('⏱️ [PersonalPass] Total generation time:', Date.now() - startTime, 'ms');
    
    return passBuffer;
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('💥 [PersonalPass] Error during pass generation:');
    console.error('💥 [PersonalPass] Error message:', error instanceof Error ? error.message : String(error));
    console.error('💥 [PersonalPass] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('💥 [PersonalPass] Error type:', error?.constructor?.name || typeof error);
    console.error('💥 [PersonalPass] Failed after:', errorTime, 'ms');
    
    // Additional error context would be logged here if available
    
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
