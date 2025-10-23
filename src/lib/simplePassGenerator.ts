import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { TastePayload } from '@/types';

const CERTS_PATH = join(process.cwd(), 'certs');

export function generateSimplePass(serial: string, prefs: TastePayload): Buffer {
  const tempDir = join(process.cwd(), 'temp', serial);
  
  try {
    // Create temp directory
    mkdirSync(tempDir, { recursive: true });
    
    // Create pass.json
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.hushh.wallet",
      teamIdentifier: "WVDK9JW99C",
      organizationName: "HushOne, Inc.",
      description: "Hushh Taste Card",
      serialNumber: serial,
      logoText: "Hushh",
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(0, 0, 0)",
      labelColor: "rgb(255, 255, 255)",
      generic: {
        primaryFields: [
          {
            key: "taste",
            label: "Taste",
            value: `${prefs.foodType} · ${prefs.spice}`
          }
        ],
        auxiliaryFields: [
          {
            key: "cuisines",
            label: "Cuisines",
            value: prefs.cuisines.length > 0 
              ? prefs.cuisines.slice(0, 2).join(", ") + (prefs.cuisines.length > 2 ? "..." : "")
              : "—"
          },
          {
            key: "brand",
            label: "Brand", 
            value: prefs.brands.length > 0 ? prefs.brands[0] : "—"
          },
          {
            key: "issued",
            label: "Issued",
            value: new Date().toISOString().split('T')[0]
          }
        ],
        backFields: [
          {
            key: "preferences",
            label: "Preferences (5)",
            value: [
              `Food: ${prefs.foodType}`,
              `Spice: ${prefs.spice}`,
              ...(prefs.cuisines.length > 0 ? [`Cuisines: ${prefs.cuisines.join(", ")}`] : []),
              ...(prefs.brands.length > 0 ? [`Brands: ${prefs.brands.join(", ")}`] : []),
              ...(prefs.lifestyle.length > 0 ? [`Lifestyle: ${prefs.lifestyle.join(", ")}`] : [])
            ].join("; ")
          },
          {
            key: "support",
            label: "Support",
            value: "Visit hushh.ai for help with your taste card"
          }
        ]
      }
    };

    const passJsonPath = join(tempDir, 'pass.json');
    writeFileSync(passJsonPath, JSON.stringify(passData, null, 2));

    // Create manifest
    const manifest: Record<string, string> = {};
    const passJsonContent = readFileSync(passJsonPath);
    manifest['pass.json'] = createHash('sha1').update(passJsonContent).digest('hex');

    const manifestPath = join(tempDir, 'manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    // Create signature using OpenSSL
    const manifestContent = readFileSync(manifestPath);
    const signaturePath = join(tempDir, 'signature');
    
    try {
      execSync(
        `openssl smime -binary -sign -certfile "${CERTS_PATH}/wwdr_certificate.pem" -signer "${CERTS_PATH}/pass_certificate.pem" -inkey "${CERTS_PATH}/pass_private_key.pem" -in "${manifestPath}" -out "${signaturePath}" -outform DER`,
        { stdio: 'pipe' }
      );
    } catch (error) {
      console.error('OpenSSL signing error:', error);
      throw new Error('Failed to sign pass');
    }

    // Create zip file
    const zipPath = join(tempDir, `${serial}.zip`);
    execSync(`cd "${tempDir}" && zip -r "${zipPath}" pass.json manifest.json signature`, { stdio: 'pipe' });

    // Read the zip file
    const zipBuffer = readFileSync(zipPath);
    
    // Cleanup
    rmSync(tempDir, { recursive: true, force: true });
    
    return zipBuffer;
    
  } catch (error) {
    // Cleanup on error
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {}
    
    console.error('Pass generation error:', error);
    throw new Error('Failed to generate pass');
  }
}
