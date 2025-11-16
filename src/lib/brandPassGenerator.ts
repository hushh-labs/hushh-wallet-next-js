import path from 'path';
import fs from 'fs';

interface BrandPassData {
  styles: string[];
  favBrands: string[];
  budgetBand: string;
  sizes: Record<string, any>;
  lean: Record<string, any>;
  issueDate: string;
  stylesSummary: string;
  brandsSummary: string;
  preferencesCount: number;
}

export async function generateBrandAppleWalletPass(passData: BrandPassData): Promise<Buffer> {
  // Try to use the existing pass generation infrastructure
  try {
    console.log('Attempting to generate Brand Preference Card pass...');
    
    // Use the custom brand template
    return await generateBrandPassWithCustomTemplate(passData);
    
  } catch (error) {
    console.log('Could not use existing pass generator, trying fallback approach:', error);
    throw new Error('Brand pass generation not yet fully implemented');
  }
}

async function generateBrandPassWithCustomTemplate(passData: BrandPassData): Promise<Buffer> {
  // Create the pass JSON structure for brand preferences
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: "pass.com.hushh.brand",
    teamIdentifier: "WVDK9JW99C",
    organizationName: "HushOne, Inc.",
    description: "Hushh Brand Preference Card",
    serialNumber: generateSerialNumber(),
    logoText: "Hushh",
    foregroundColor: "rgb(255, 250, 245)",
    backgroundColor: "rgb(35, 42, 49)", // Slightly lighter for brand card
    labelColor: "rgb(180, 175, 170)",
    generic: {
      primaryFields: [
        {
          key: "styles",
          label: "Style Vibe",
          value: passData.stylesSummary
        }
      ],
      secondaryFields: [
        {
          key: "budget",
          label: "Budget",
          value: passData.budgetBand
        },
        ...(passData.favBrands.length > 0 ? [{
          key: "brands",
          label: "Favorite Brands",
          value: passData.favBrands.length > 2 
            ? `${passData.favBrands.slice(0, 2).join(', ')} +${passData.favBrands.length - 2}`
            : passData.brandsSummary
        }] : [])
      ],
      auxiliaryFields: [
        {
          key: "preferences",
          label: "Total Preferences",
          value: `${passData.preferencesCount} selected`
        },
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
          key: "stylesList",
          label: "Style Preferences",
          value: passData.styles.join('\n• ')
        },
        ...(passData.favBrands.length > 0 ? [{
          key: "brandsList",
          label: "Favorite Brands",
          value: passData.favBrands.join('\n• ')
        }] : [{
          key: "brandsNote",
          label: "Brand Preference",
          value: "Open to any brands - no specific preferences"
        }]),
        {
          key: "budgetDetail",
          label: "Budget Range",
          value: passData.budgetBand
        },
        {
          key: "cardInfo",
          label: "About This Card",
          value: "Your style and brand preferences for personalized shopping recommendations. Share this card with retailers for tailored suggestions."
        },
        {
          key: "usage",
          label: "How to Use",
          value: "Show this card at stores, fashion consultants, or stylists to communicate your preferences instantly. Your style DNA, simplified."
        },
        {
          key: "privacy",
          label: "Privacy Notice",
          value: "Your preferences are stored securely and only shared when you choose to present this card."
        },
        {
          key: "support",
          label: "Support",
          value: "Visit hushh.ai for help • Card ID: " + generateSerialNumber().slice(-8)
        }
      ]
    }
  };

  // For now, return a JSON representation as we did with other cards
  // In production, this would use proper certificate signing
  const demoPassContent = {
    message: "Brand Preference Card - Demo Mode",
    note: "This is a demonstration. In production, this would be a properly signed .pkpass file.",
    passData: passJson,
    instructions: "To implement full Apple Wallet integration, set up proper certificate signing in a server environment.",
    timestamp: new Date().toISOString(),
    cardType: "BRAND"
  };

  // Convert to buffer for consistency with other generators
  const jsonString = JSON.stringify(demoPassContent, null, 2);
  return Buffer.from(jsonString, 'utf-8');
}

function generateSerialNumber(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `H-BRAND-${timestamp}${randomStr}`.toUpperCase();
}

// Demo function for testing
export function generateBrandDemoPass(passData: BrandPassData): any {
  return {
    message: "Demo Brand Preference Card",
    passData: passData,
    serialNumber: generateSerialNumber(),
    note: "This is a demo. In production, this would generate a proper .pkpass file.",
    timestamp: new Date().toISOString()
  };
}
