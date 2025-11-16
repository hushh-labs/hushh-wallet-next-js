import { NextRequest, NextResponse } from 'next/server';
import { PKPass } from 'passkit-generator';
import * as fs from 'fs';
import * as path from 'path';

// Comprehensive Apple Wallet Pass Generation API
// Supports all Apple Wallet features: QR codes, locations, notifications, etc.

interface PassField {
  key: string;
  label?: string;
  value: string;
  changeMessage?: string;
  textAlignment?: 'PKTextAlignmentLeft' | 'PKTextAlignmentCenter' | 'PKTextAlignmentRight' | 'PKTextAlignmentNatural';
  attributedValue?: string;
  dataDetectorTypes?: string[];
  currencyCode?: string;
  dateStyle?: 'PKDateStyleNone' | 'PKDateStyleShort' | 'PKDateStyleMedium' | 'PKDateStyleLong' | 'PKDateStyleFull';
  timeStyle?: 'PKDateStyleNone' | 'PKDateStyleShort' | 'PKDateStyleMedium' | 'PKDateStyleLong' | 'PKDateStyleFull';
  isRelative?: boolean;
  ignoresTimeZone?: boolean;
}

interface PassLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  relevantText?: string;
}

interface PassBarcode {
  message: string;
  format: 'PKBarcodeFormatQR' | 'PKBarcodeFormatPDF417' | 'PKBarcodeFormatAztec' | 'PKBarcodeFormatCode128';
  messageEncoding?: string;
  altText?: string;
}

interface PassBeacon {
  proximityUUID: string;
  major?: number;
  minor?: number;
  relevantText?: string;
}

interface UniversalPassRequest {
  // Pass Type & Identity
  passType: 'boardingPass' | 'coupon' | 'eventTicket' | 'generic' | 'storeCard';
  transitType?: 'PKTransitTypeAir' | 'PKTransitTypeBus' | 'PKTransitTypeTrain' | 'PKTransitTypeBoat' | 'PKTransitTypeGeneric';
  
  // Basic Info
  description: string;
  organizationName?: string;
  logoText?: string;
  
  // Visual Design
  backgroundColor?: string;
  foregroundColor?: string;
  labelColor?: string;
  
  // Pass Fields
  primaryFields?: PassField[];
  secondaryFields?: PassField[];
  auxiliaryFields?: PassField[];
  headerFields?: PassField[];
  backFields?: PassField[];
  
  // QR Code / Barcode
  barcode?: PassBarcode;
  barcodes?: PassBarcode[];
  
  // Location & Relevance
  locations?: PassLocation[];
  beacons?: PassBeacon[];
  maxDistance?: number;
  relevantDate?: string;
  expirationDate?: string;
  
  // Web Service & Updates
  webServiceURL?: string;
  authenticationToken?: string;
  
  // Sharing & Behavior
  sharingProhibited?: boolean;
  voided?: boolean;
  suppressStripShine?: boolean;
  
  // Associated App
  associatedStoreIdentifiers?: number[];
  appLaunchURL?: string;
  userInfo?: Record<string, any>;
  
  // Custom Data
  customData?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const passRequest: UniversalPassRequest = await request.json();
    
    console.log('🎫 Universal Pass Generation Started');
    console.log('Pass Type:', passRequest.passType);
    console.log('Description:', passRequest.description);
    
    const projectRoot = process.cwd();
    
    // Load certificates
    const signerCert = fs.readFileSync(path.join(projectRoot, 'signerCert.pem'), 'utf8');
    const signerKey = fs.readFileSync(path.join(projectRoot, 'signerKey.pem'), 'utf8');
    const wwdr = fs.readFileSync(path.join(projectRoot, 'wwdr.pem'), 'utf8');
    
    // Generate unique serial number
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9).toUpperCase();
    const serialNumber = `HUSHH-${timestamp}-${randomSuffix}`;
    const issueDate = new Date().toISOString();
    
    // Build pass data structure
    const passData: any = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.hushh.wallet",
      teamIdentifier: "WVDK9JW99C",
      serialNumber: serialNumber,
      organizationName: passRequest.organizationName || "HushOne, Inc.",
      description: passRequest.description,
      logoText: passRequest.logoText || "HUSHH",
      
      // Visual styling
      foregroundColor: passRequest.foregroundColor || "rgb(255, 248, 235)",
      backgroundColor: passRequest.backgroundColor || "rgb(117, 65, 10)",
      labelColor: passRequest.labelColor || "rgb(216, 178, 111)",
      
      // Pass type specific structure
      [passRequest.passType]: {
        primaryFields: passRequest.primaryFields || [],
        secondaryFields: passRequest.secondaryFields || [],
        auxiliaryFields: passRequest.auxiliaryFields || [],
        headerFields: passRequest.headerFields || [],
        backFields: passRequest.backFields || [],
      }
    };
    
    // Add transit type for boarding passes
    if (passRequest.passType === 'boardingPass' && passRequest.transitType) {
      passData[passRequest.passType].transitType = passRequest.transitType;
    }
    
    // Add barcode/QR code
    if (passRequest.barcode) {
      passData.barcode = passRequest.barcode;
    }
    if (passRequest.barcodes) {
      passData.barcodes = passRequest.barcodes;
    }
    
    // Add location-based features
    if (passRequest.locations && passRequest.locations.length > 0) {
      passData.locations = passRequest.locations;
      if (passRequest.maxDistance) {
        passData.maxDistance = passRequest.maxDistance;
      }
    }
    
    // Add beacon support
    if (passRequest.beacons && passRequest.beacons.length > 0) {
      passData.beacons = passRequest.beacons;
    }
    
    // Add dates
    if (passRequest.relevantDate) {
      passData.relevantDate = passRequest.relevantDate;
    }
    if (passRequest.expirationDate) {
      passData.expirationDate = passRequest.expirationDate;
    }
    
    // Add web service
    if (passRequest.webServiceURL && passRequest.authenticationToken) {
      passData.webService = {
        webServiceURL: passRequest.webServiceURL,
        authenticationToken: passRequest.authenticationToken
      };
    }
    
    // Add sharing and behavior settings
    if (passRequest.sharingProhibited !== undefined) {
      passData.sharingProhibited = passRequest.sharingProhibited;
    }
    if (passRequest.voided !== undefined) {
      passData.voided = passRequest.voided;
    }
    if (passRequest.suppressStripShine !== undefined) {
      passData.suppressStripShine = passRequest.suppressStripShine;
    }
    
    // Add associated app info
    if (passRequest.associatedStoreIdentifiers) {
      passData.associatedStoreIdentifiers = passRequest.associatedStoreIdentifiers;
    }
    if (passRequest.appLaunchURL) {
      passData.appLaunchURL = passRequest.appLaunchURL;
    }
    if (passRequest.userInfo) {
      passData.userInfo = passRequest.userInfo;
    }
    
    // Add custom data
    if (passRequest.customData) {
      Object.assign(passData, passRequest.customData);
    }
    
    // Create temporary pass directory
    const tempPassDir = path.join('/tmp', `universal-pass-${timestamp}.pass`);
    if (!fs.existsSync(tempPassDir)) {
      fs.mkdirSync(tempPassDir, { recursive: true });
    }
    
    // Write pass.json
    fs.writeFileSync(
      path.join(tempPassDir, 'pass.json'),
      JSON.stringify(passData, null, 2)
    );
    
    // Copy default icons (you can customize this logic)
    const defaultIconPath = path.join(projectRoot, 'passModels', 'personal.pass', 'icon.png');
    if (fs.existsSync(defaultIconPath)) {
      fs.copyFileSync(defaultIconPath, path.join(tempPassDir, 'icon.png'));
      const logoPath = path.join(projectRoot, 'passModels', 'personal.pass', 'logo.png');
      if (fs.existsSync(logoPath)) {
        fs.copyFileSync(logoPath, path.join(tempPassDir, 'logo.png'));
      }
    }
    
    // Create PKPass
    const pass = await PKPass.from({
      model: tempPassDir,
      certificates: {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase: undefined
      }
    });
    
    // Generate buffer
    const buffer = pass.getAsBuffer();
    
    // Cleanup temp directory
    fs.rmSync(tempPassDir, { recursive: true, force: true });
    
    console.log('✅ Universal Pass generated successfully');
    console.log('Serial Number:', serialNumber);
    console.log('Buffer Size:', buffer.length, 'bytes');
    
    // Return the pass as download
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="HushhPass-${serialNumber}.pkpass"`,
        'Content-Length': buffer.length.toString(),
        'X-Pass-Serial': serialNumber,
        'X-Pass-Type': passRequest.passType
      }
    });
    
  } catch (error) {
    console.error('❌ Universal Pass generation failed:', error);
    
    // Cleanup on error
    try {
      const tempDirs = fs.readdirSync('/tmp').filter((file: string) => 
        file.startsWith('universal-pass-') && file.endsWith('.pass')
      );
      tempDirs.forEach((dir: string) => {
        const fullPath = path.join('/tmp', dir);
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        }
      });
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    
    return NextResponse.json({
      success: false,
      error: 'Universal Pass generation failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// GET endpoint for API documentation
export async function GET(request: NextRequest) {
  const documentation = {
    title: "Universal Apple Wallet Pass Generator",
    description: "Create any type of Apple Wallet pass with complete feature support",
    version: "1.0.0",
    endpoint: "/api/passes/universal/create",
    method: "POST",
    features: [
      "✅ All pass types: boardingPass, coupon, eventTicket, generic, storeCard",
      "✅ QR codes, barcodes (QR, PDF417, Aztec, Code128)",
      "✅ Location-based notifications",
      "✅ iBeacon support",
      "✅ Custom colors and styling",
      "✅ Multiple field types with formatting",
      "✅ Web service integration for updates",
      "✅ App integration",
      "✅ Sharing controls",
      "✅ Date/time relevance",
      "✅ Custom data injection"
    ],
    passTypes: [
      {
        type: "boardingPass",
        description: "Flight, train, bus, boat tickets",
        transitTypes: ["PKTransitTypeAir", "PKTransitTypeBus", "PKTransitTypeTrain", "PKTransitTypeBoat", "PKTransitTypeGeneric"],
        example: "Flight boarding passes, train tickets"
      },
      {
        type: "coupon",
        description: "Discount coupons and offers",
        example: "Store discounts, promotional offers"
      },
      {
        type: "eventTicket",
        description: "Event admission tickets",
        example: "Concert tickets, movie tickets, sports events"
      },
      {
        type: "generic",
        description: "General purpose passes",
        example: "ID cards, membership cards, loyalty cards"
      },
      {
        type: "storeCard",
        description: "Retail loyalty and membership cards",
        example: "Coffee shop loyalty, gym membership"
      }
    ],
    barcodeFormats: [
      "PKBarcodeFormatQR",
      "PKBarcodeFormatPDF417",
      "PKBarcodeFormatAztec",
      "PKBarcodeFormatCode128"
    ],
    fieldTypes: [
      "primaryFields - Main content, large display",
      "secondaryFields - Important secondary info",
      "auxiliaryFields - Additional details",
      "headerFields - Top area content",
      "backFields - Detailed info on pass back"
    ],
    examples: {
      basic: {
        passType: "generic",
        description: "My Personal Card",
        primaryFields: [
          { key: "name", label: "Name", value: "John Doe" }
        ],
        barcode: {
          message: "USER123456",
          format: "PKBarcodeFormatQR"
        }
      },
      boarding: {
        passType: "boardingPass",
        transitType: "PKTransitTypeAir",
        description: "Flight Boarding Pass",
        primaryFields: [
          { key: "origin", value: "NYC" },
          { key: "destination", value: "LAX" }
        ],
        secondaryFields: [
          { key: "gate", label: "Gate", value: "A12" },
          { key: "seat", label: "Seat", value: "14F" }
        ],
        barcode: {
          message: "FLIGHT123456789",
          format: "PKBarcodeFormatPDF417"
        }
      }
    }
  };
  
  return NextResponse.json(documentation);
}
