import { TastePayload } from '@/types';

export function generateSimplePass(serial: string, prefs: TastePayload): any {
  // Create a minimal pass structure for demo purposes
  // In production, you would use a proper Apple Wallet pass generation service
  
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
          value: prefs.dishTypes.length > 0 ? prefs.dishTypes[0] : "—"
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
            ...(prefs.dishTypes.length > 0 ? [`Dish Types: ${prefs.dishTypes.join(", ")}`] : []),
            ...(prefs.dietary.length > 0 ? [`Dietary: ${prefs.dietary.join(", ")}`] : [])
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

  // For demo purposes, return a JSON representation
  // In production, this would be a properly signed .pkpass file
  const demoPassContent = {
    message: "Demo Apple Wallet Pass",
    note: "This is a demonstration. In production, this would be a properly signed .pkpass file.",
    passData: passData,
    instructions: "To implement full Apple Wallet integration, you need to set up proper certificate signing in a server environment with OpenSSL access.",
    timestamp: new Date().toISOString()
  };

  return JSON.stringify(demoPassContent, null, 2);
}
