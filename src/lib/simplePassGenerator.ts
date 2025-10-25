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
    foregroundColor: "rgb(255, 250, 245)",
    backgroundColor: "rgb(20, 25, 30)",
    labelColor: "rgb(180, 175, 170)",
    generic: {
      primaryFields: [
        {
          key: "foodProfile",
          label: "Food Profile",
          value: `${prefs.foodType} · ${prefs.spice} Spice`
        }
      ],
      secondaryFields: [
        {
          key: "topCuisines",
          label: "Top Cuisines",
          value: prefs.cuisines.length > 0 
            ? prefs.cuisines.slice(0, 2).join(" • ") + (prefs.cuisines.length > 2 ? " • +" + (prefs.cuisines.length - 2) : "")
            : "None selected"
        }
      ],
      auxiliaryFields: [
        {
          key: "dishPrefs",
          label: "Dish Types", 
          value: prefs.dishTypes.length > 0 ? prefs.dishTypes.slice(0, 2).join(" • ") : "Any"
        },
        {
          key: "dietary",
          label: "Dietary",
          value: prefs.dietary.length > 0 ? prefs.dietary.slice(0, 2).join(" • ") : "None"
        },
        {
          key: "issued",
          label: "Created",
          value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
      ],
      backFields: [
        {
          key: "fullProfile",
          label: "Complete Food Profile",
          value: `${prefs.foodType} • ${prefs.spice} Spice Level`
        },
        {
          key: "allCuisines",
          label: "Preferred Cuisines",
          value: prefs.cuisines.length > 0 ? prefs.cuisines.join(" • ") : "No specific preferences"
        },
        {
          key: "allDishTypes",
          label: "Favorite Dish Types",
          value: prefs.dishTypes.length > 0 ? prefs.dishTypes.join(" • ") : "Open to all types"
        },
        {
          key: "allDietary",
          label: "Dietary Requirements",
          value: prefs.dietary.length > 0 ? prefs.dietary.join(" • ") : "No restrictions"
        },
        {
          key: "cardInfo",
          label: "About This Card",
          value: "Show this card to restaurants, hotels, or share the link for personalized food recommendations based on your 5 preferences."
        },
        {
          key: "support",
          label: "Support",
          value: "Visit hushh.ai for help • Card ID: " + serial.slice(-8)
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
