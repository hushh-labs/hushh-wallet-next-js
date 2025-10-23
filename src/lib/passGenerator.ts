import { PKPass } from 'passkit-generator';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TastePayload } from '@/types';

const CERTS_PATH = join(process.cwd(), 'certs');
const PASS_MODELS_PATH = join(process.cwd(), 'public', 'pass-models');

// Certificate paths
const SIGNER_CERT_PATH = join(CERTS_PATH, 'pass_certificate.pem');
const SIGNER_KEY_PATH = join(CERTS_PATH, 'pass_private_key.pem');
const WWDR_CERT_PATH = join(CERTS_PATH, 'wwdr_certificate.pem');

export async function createTasteCard(serial: string, prefs: TastePayload): Promise<Buffer> {
  try {
    // Read certificates
    const signerCert = readFileSync(SIGNER_CERT_PATH);
    const signerKey = readFileSync(SIGNER_KEY_PATH);
    const wwdrCert = readFileSync(WWDR_CERT_PATH);

    // Create pass template
    const passTemplate = {
      // Pass identification
      passTypeIdentifier: "pass.com.hushh.wallet",
      teamIdentifier: "WVDK9JW99C",
      organizationName: "HushOne, Inc.",
      description: "Hushh Taste Card",
      serialNumber: serial,
      
      // Visual formatting
      formatVersion: 1,
      logoText: "Hushh",
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(0, 0, 0)",
      labelColor: "rgb(255, 255, 255)",
      
      // Pass structure - Generic pass
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

    // Create the pass
    const pass = new PKPass(
      passTemplate,
      {
        signerCert,
        signerKey,
        wwdr: wwdrCert,
        signerKeyPassphrase: "" // No passphrase for extracted PEM key
      }
    );

    return pass.asBuffer();
  } catch (error) {
    console.error('Error creating pass:', error);
    throw new Error('Failed to generate pass');
  }
}

export function formatPreferencesForPass(prefs: TastePayload): {
  primaryValue: string;
  cuisinesValue: string;
  brandValue: string;
  backFieldValue: string;
} {
  return {
    primaryValue: `${prefs.foodType} · ${prefs.spice}`,
    cuisinesValue: prefs.cuisines.length > 0 
      ? prefs.cuisines.slice(0, 2).join(", ") + (prefs.cuisines.length > 2 ? "..." : "")
      : "—",
    brandValue: prefs.brands.length > 0 ? prefs.brands[0] : "—",
    backFieldValue: [
      `Food: ${prefs.foodType}`,
      `Spice: ${prefs.spice}`,
      ...(prefs.cuisines.length > 0 ? [`Cuisines: ${prefs.cuisines.join(", ")}`] : []),
      ...(prefs.brands.length > 0 ? [`Brands: ${prefs.brands.join(", ")}`] : []),
      ...(prefs.lifestyle.length > 0 ? [`Lifestyle: ${prefs.lifestyle.join(", ")}`] : [])
    ].join("; ")
  };
}
