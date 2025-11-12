import { PKPass } from 'passkit-generator';
import { readFileSync } from 'fs';
import { join } from 'path';
import { UserRecord } from '@/types';
import { calculateAge, shareIdManager } from './tokenization';

export async function generateHushhIdPass(userRecord: UserRecord): Promise<Buffer> {
  try {
    const projectRoot = process.cwd();
    
    // Read the properly extracted PEM certificates 
    const signerCert = readFileSync(join(projectRoot, 'signerCert.pem'), 'utf8');
    const signerKey = readFileSync(join(projectRoot, 'signerKey.pem'), 'utf8');
    const wwdr = readFileSync(join(projectRoot, 'wwdr.pem'), 'utf8');

    console.log('Certificates loaded for Hushh ID pass');

    // Prepare pass data
    const age = calculateAge(userRecord.profile.dob);
    const shareUrl = shareIdManager.createShareUrl(userRecord.card.activeShareId);
    const issueDate = new Date();
    const serialSuffix = userRecord.card.passSerial.split('-').pop() || 'XXXXX';

    // Format cuisines for display (max 3, comma-separated)
    const cuisinesDisplay = userRecord.food.topCuisines.length > 0 
      ? userRecord.food.topCuisines.slice(0, 3).join(', ')
      : 'Not specified';

    // Use PKPass.from() with the model directory - this is the correct approach
    const pass = await PKPass.from({
      model: join(projectRoot, 'passModels', 'hushhid.pass'),
      certificates: {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase: undefined // Use undefined for unencrypted keys
      }
    }, {
      // Override pass.json data
      serialNumber: userRecord.card.passSerial,
      description: `${userRecord.profile.preferredName}'s hushh ID Card`
    });

    // Clear existing fields and add our data
    pass.primaryFields.splice(0);
    pass.secondaryFields.splice(0);
    pass.auxiliaryFields.splice(0);
    pass.backFields.splice(0);

    // Add primary field (preferred name only)
    pass.primaryFields.push({
      key: 'preferredName',
      label: '',
      value: userRecord.profile.preferredName,
      textAlignment: 'PKTextAlignmentCenter'
    });

    // Add back fields with all the details
    pass.backFields.push({
      key: 'qrInfo',
      label: 'Scan to View',
      value: 'Identity & food preferences'
    });

    pass.backFields.push({
      key: 'age',
      label: 'Age',
      value: `${age} years old`
    });

    pass.backFields.push({
      key: 'foodType',
      label: 'Diet',
      value: userRecord.food.foodType
    });

    pass.backFields.push({
      key: 'spiceLevel',
      label: 'Spice Level',
      value: userRecord.food.spiceLevel
    });

    if (userRecord.food.topCuisines.length > 0) {
      pass.backFields.push({
        key: 'cuisines',
        label: 'Favorite Cuisines',
        value: cuisinesDisplay
      });
    }

    pass.backFields.push({
      key: 'privacy',
      label: 'Privacy Notice',
      value: 'Your identity and preferences are privacy-first. Only sanitized data is shared when you present this card.'
    });

    pass.backFields.push({
      key: 'support',
      label: 'Support',
      value: `Visit hushh.ai for help • Card ID: ${serialSuffix}`
    });

    // Set the QR code
    pass.setBarcodes({
      message: shareUrl,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1'
    });

    console.log('Hushh ID pass created successfully using PKPass.from()');

    // Generate the pass buffer
    const passBuffer = pass.getAsBuffer();
    console.log('Pass buffer generated, size:', passBuffer.length);
    
    return passBuffer;

  } catch (error) {
    console.error('Error generating Hushh ID pass:', error);
    throw new Error(`Failed to generate pass: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to format pass data for preview
export function formatHushhIdPassData(userRecord: UserRecord) {
  const age = calculateAge(userRecord.profile.dob);
  const shareUrl = shareIdManager.createShareUrl(userRecord.card.activeShareId);
  
  return {
    preferredName: userRecord.profile.preferredName,
    age,
    foodType: userRecord.food.foodType,
    spiceLevel: userRecord.food.spiceLevel,
    cuisines: userRecord.food.topCuisines.slice(0, 3),
    dishStyles: userRecord.food.dishStyles.slice(0, 3),
    exclusions: userRecord.food.exclusions.slice(0, 2),
    shareUrl,
    passSerial: userRecord.card.passSerial
  };
}

// Simple fallback pass generation (for demo/development)
export async function generateDemoHushhIdPass(userRecord: UserRecord) {
  const age = calculateAge(userRecord.profile.dob);
  const shareUrl = shareIdManager.createShareUrl(userRecord.card.activeShareId);
  
  return {
    type: 'demo',
    data: {
      preferredName: userRecord.profile.preferredName,
      age,
      foodType: userRecord.food.foodType,
      spiceLevel: userRecord.food.spiceLevel,
      cuisines: userRecord.food.topCuisines.join(', ') || 'Not specified',
      shareUrl,
      passSerial: userRecord.card.passSerial
    },
    url: `/api/demo-pass/${userRecord.card.passSerial}`,
    message: 'Demo mode - actual pass generation requires certificates'
  };
}
