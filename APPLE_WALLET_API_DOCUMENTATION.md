# Apple Wallet Pass Generator - Complete API Documentation

## 🎯 Overview

Complete Apple Wallet pass generation system with full feature support including QR codes, location notifications, web services, and all Apple Wallet pass types.

## 🚀 Quick Start

### Dashboard
Visit `/pass-builder` for the visual pass builder interface.

### API Endpoint
```
POST /api/passes/universal/create
```

## 📱 Supported Pass Types

### 1. Generic Pass
General purpose passes - ID cards, membership cards, etc.
```json
{
  "passType": "generic",
  "description": "My Custom Pass",
  "primaryFields": [
    { "key": "name", "label": "Name", "value": "John Doe" }
  ]
}
```

### 2. Boarding Pass
Flight, train, bus, boat tickets with transit-specific features.
```json
{
  "passType": "boardingPass",
  "transitType": "PKTransitTypeAir",
  "description": "Flight Boarding Pass",
  "primaryFields": [
    { "key": "origin", "value": "NYC" },
    { "key": "destination", "value": "LAX" }
  ],
  "secondaryFields": [
    { "key": "gate", "label": "Gate", "value": "A12" },
    { "key": "seat", "label": "Seat", "value": "14F" }
  ]
}
```

**Transit Types:**
- `PKTransitTypeAir` - Airlines
- `PKTransitTypeBus` - Bus services
- `PKTransitTypeTrain` - Rail transport
- `PKTransitTypeBoat` - Water transport
- `PKTransitTypeGeneric` - Other transport

### 3. Event Ticket
Concert, movie, sports event tickets.
```json
{
  "passType": "eventTicket",
  "description": "Concert Ticket",
  "primaryFields": [
    { "key": "event", "value": "The Beatles Revival" }
  ],
  "secondaryFields": [
    { "key": "venue", "label": "Venue", "value": "Madison Square Garden" },
    { "key": "date", "label": "Date", "value": "Dec 15, 2024" }
  ]
}
```

### 4. Store Card
Loyalty cards, membership cards, gift cards.
```json
{
  "passType": "storeCard",
  "description": "Coffee Shop Loyalty Card",
  "primaryFields": [
    { "key": "points", "label": "Points", "value": "1,250" }
  ]
}
```

### 5. Coupon
Discount coupons and promotional offers.
```json
{
  "passType": "coupon",
  "description": "20% Off Coupon",
  "primaryFields": [
    { "key": "discount", "value": "20% OFF" }
  ]
}
```

## 🏗️ Field Types & Layout

### Primary Fields
Large, prominent display - main content of the pass.
```json
"primaryFields": [
  {
    "key": "name",
    "label": "Name", 
    "value": "John Doe",
    "textAlignment": "PKTextAlignmentLeft"
  }
]
```

### Secondary Fields
Important secondary information.
```json
"secondaryFields": [
  {
    "key": "email",
    "label": "Contact",
    "value": "john@example.com"
  }
]
```

### Auxiliary Fields
Additional details, smaller text.
```json
"auxiliaryFields": [
  {
    "key": "issued",
    "label": "Issued",
    "value": "2024-11-16"
  }
]
```

### Header Fields
Top area of the pass.
```json
"headerFields": [
  {
    "key": "category",
    "value": "VIP"
  }
]
```

### Back Fields
Detailed information on the back of the pass.
```json
"backFields": [
  {
    "key": "terms",
    "label": "Terms & Conditions",
    "value": "Valid for 30 days. Cannot be combined with other offers."
  }
]
```

## 🎨 Visual Customization

### Colors
All colors support CSS formats: hex, rgb(), rgba(), hsl(), etc.

```json
{
  "backgroundColor": "rgb(117, 65, 10)",
  "foregroundColor": "rgb(255, 248, 235)", 
  "labelColor": "rgb(216, 178, 111)"
}
```

### Branding
```json
{
  "organizationName": "Your Company",
  "logoText": "BRAND",
  "description": "Pass description shown in lists"
}
```

## 📱 QR Codes & Barcodes

### Single Barcode
```json
{
  "barcode": {
    "message": "USER123456789",
    "format": "PKBarcodeFormatQR",
    "messageEncoding": "iso-8859-1",
    "altText": "User ID: 123456789"
  }
}
```

### Multiple Barcodes
```json
{
  "barcodes": [
    {
      "message": "TICKET123",
      "format": "PKBarcodeFormatQR"
    },
    {
      "message": "BACKUP456", 
      "format": "PKBarcodeFormatPDF417"
    }
  ]
}
```

### Supported Barcode Formats
- `PKBarcodeFormatQR` - QR Code (recommended)
- `PKBarcodeFormatPDF417` - PDF417 (used by airlines)
- `PKBarcodeFormatAztec` - Aztec code
- `PKBarcodeFormatCode128` - Code 128 barcode

## 📍 Location-Based Notifications

Trigger notifications when users are near specific locations.

```json
{
  "locations": [
    {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "altitude": 100,
      "relevantText": "Welcome to our store!"
    }
  ],
  "maxDistance": 100
}
```

### Use Cases
- **Retail**: Notify when near store
- **Events**: Remind about event when near venue  
- **Transportation**: Show boarding pass at airport/station
- **Restaurants**: Loyalty card when near location

## 📡 iBeacon Support

Trigger notifications based on Bluetooth beacons.

```json
{
  "beacons": [
    {
      "proximityUUID": "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
      "major": 1,
      "minor": 100,
      "relevantText": "Scan your pass at the gate"
    }
  ]
}
```

## 📅 Date & Time Features

### Relevant Date
When the pass is most relevant (appears on lock screen).
```json
{
  "relevantDate": "2024-12-15T19:30:00Z"
}
```

### Expiration Date
When the pass expires and grays out.
```json
{
  "expirationDate": "2024-12-31T23:59:59Z"
}
```

## 🔄 Web Service Integration

Enable pass updates via web service.

```json
{
  "webServiceURL": "https://yourapi.com/wallet",
  "authenticationToken": "your-secret-token"
}
```

### Update Flow
1. Apple polls your webServiceURL with authenticationToken
2. Return HTTP 200 with new pass data to update
3. Return HTTP 204 if no updates needed
4. Pass automatically updates on user's device

## 🔒 Security & Sharing

### Sharing Controls
```json
{
  "sharingProhibited": true
}
```

### Pass States
```json
{
  "voided": false
}
```

### Visual Effects
```json
{
  "suppressStripShine": true
}
```

## 📱 App Integration

### Associated Apps
Link pass to your iOS app.
```json
{
  "associatedStoreIdentifiers": [123456789],
  "appLaunchURL": "myapp://wallet/pass/123"
}
```

### Custom Data
Include additional data for your app.
```json
{
  "userInfo": {
    "userId": "12345",
    "tier": "premium",
    "customData": "any-value"
  }
}
```

## 🎯 Field Formatting Options

### Text Alignment
```json
{
  "key": "amount",
  "label": "Amount",
  "value": "$25.00",
  "textAlignment": "PKTextAlignmentRight"
}
```

**Options:**
- `PKTextAlignmentLeft` (default)
- `PKTextAlignmentCenter`
- `PKTextAlignmentRight`
- `PKTextAlignmentNatural`

### Currency Formatting
```json
{
  "key": "price",
  "label": "Price", 
  "value": "2500",
  "currencyCode": "USD"
}
```

### Date Formatting
```json
{
  "key": "event_date",
  "label": "Event Date",
  "value": "2024-12-15T19:30:00Z",
  "dateStyle": "PKDateStyleMedium",
  "timeStyle": "PKDateStyleShort",
  "isRelative": false,
  "ignoresTimeZone": true
}
```

### Change Messages
Notification text when field value updates.
```json
{
  "key": "gate",
  "label": "Gate", 
  "value": "A12",
  "changeMessage": "Gate changed to %@"
}
```

### Data Detection
Auto-detect and link phone numbers, URLs, etc.
```json
{
  "key": "phone",
  "label": "Phone",
  "value": "+1-555-123-4567",
  "dataDetectorTypes": ["PKDataDetectorTypePhoneNumber"]
}
```

## 📝 Complete Example

### Professional Event Ticket
```json
{
  "passType": "eventTicket",
  "description": "TechConf 2024 - Premium Pass",
  "organizationName": "TechConf Events",
  "logoText": "TECHCONF",
  
  "backgroundColor": "rgb(25, 25, 112)",
  "foregroundColor": "rgb(255, 255, 255)",
  "labelColor": "rgb(176, 196, 222)",
  
  "primaryFields": [
    {
      "key": "event",
      "value": "TechConf 2024"
    }
  ],
  
  "secondaryFields": [
    {
      "key": "attendee",
      "label": "Attendee", 
      "value": "John Developer"
    },
    {
      "key": "ticket_type",
      "label": "Ticket",
      "value": "Premium"
    }
  ],
  
  "auxiliaryFields": [
    {
      "key": "date",
      "label": "Date",
      "value": "Dec 15-17, 2024"
    },
    {
      "key": "venue",
      "label": "Venue", 
      "value": "Convention Center"
    }
  ],
  
  "backFields": [
    {
      "key": "schedule",
      "label": "Schedule",
      "value": "Day 1: Keynotes\nDay 2: Workshops\nDay 3: Networking"
    },
    {
      "key": "wifi",
      "label": "WiFi",
      "value": "Network: TechConf2024\nPassword: innovation!"
    },
    {
      "key": "contact", 
      "label": "Support",
      "value": "Email: support@techconf.com\nPhone: +1-555-TECH-CONF"
    }
  ],
  
  "barcode": {
    "message": "TECHCONF2024-PREMIUM-JOHNDOE-001",
    "format": "PKBarcodeFormatQR",
    "altText": "Ticket ID: TECHCONF2024-001"
  },
  
  "locations": [
    {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "relevantText": "Welcome to TechConf 2024!"
    }
  ],
  
  "relevantDate": "2024-12-15T09:00:00Z",
  "expirationDate": "2024-12-17T23:59:59Z",
  
  "webServiceURL": "https://api.techconf.com/wallet",
  "authenticationToken": "techconf-wallet-token-2024"
}
```

## 🔧 Testing Examples

### Simple Generic Pass
```bash
curl -X POST "http://localhost:3000/api/passes/universal/create" \
  -H "Content-Type: application/json" \
  -d '{
    "passType": "generic",
    "description": "Test Pass",
    "primaryFields": [
      {"key": "name", "label": "Name", "value": "Test User"}
    ],
    "barcode": {
      "message": "TEST123",
      "format": "PKBarcodeFormatQR"
    }
  }' \
  -o test-pass.pkpass
```

### Boarding Pass with Location
```bash
curl -X POST "http://localhost:3000/api/passes/universal/create" \
  -H "Content-Type: application/json" \
  -d '{
    "passType": "boardingPass", 
    "transitType": "PKTransitTypeAir",
    "description": "Flight AA123",
    "primaryFields": [
      {"key": "origin", "value": "NYC"},
      {"key": "destination", "value": "LAX"}
    ],
    "locations": [
      {
        "latitude": 40.6413,
        "longitude": -73.7781,
        "relevantText": "Flight AA123 boarding soon"
      }
    ],
    "barcode": {
      "message": "AA123NYCLAX20241215",
      "format": "PKBarcodeFormatPDF417"
    }
  }' \
  -o flight-pass.pkpass
```

## 📊 Response Headers

The API returns these helpful headers:

```
Content-Type: application/vnd.apple.pkpass
Content-Disposition: attachment; filename="HushhPass-{serial}.pkpass"
X-Pass-Serial: HUSHH-1234567890-ABC123XYZ
X-Pass-Type: generic
```

## ❗ Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "success": false,
  "error": "Invalid pass data",
  "details": "Missing required field: description"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Pass generation failed", 
  "details": "Certificate error: Invalid signer certificate"
}
```

### Validation Rules

1. **Required Fields**: `passType`, `description`
2. **Pass Type**: Must be one of: `generic`, `boardingPass`, `coupon`, `eventTicket`, `storeCard`
3. **Transit Type**: Required for `boardingPass` type
4. **Colors**: Must be valid CSS color strings
5. **Dates**: Must be valid ISO 8601 format
6. **Locations**: Latitude must be between -90 and 90, longitude between -180 and 180

## 🌐 Dashboard Features

Access the visual pass builder at `/pass-builder`:

- ✅ **Live Preview**: See changes in real-time
- ✅ **All Pass Types**: Support for all 5 Apple pass types  
- ✅ **Visual Color Picker**: Easy color customization
- ✅ **Field Management**: Add/edit/remove fields dynamically
- ✅ **QR Code Builder**: Configure barcodes visually
- ✅ **Location Mapping**: Set up location notifications
- ✅ **API Export**: Copy cURL commands for automation
- ✅ **Template Library**: Pre-built pass templates
- ✅ **Validation**: Real-time error checking

## 🚀 Advanced Use Cases

### Dynamic Loyalty Card
```json
{
  "passType": "storeCard",
  "description": "Coffee Shop Loyalty",
  "primaryFields": [
    {
      "key": "points",
      "label": "Points",
      "value": "850",
      "changeMessage": "Points updated: %@"
    }
  ],
  "locations": [
    {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "relevantText": "Earn double points today!"
    }
  ],
  "webServiceURL": "https://api.coffeeshop.com/loyalty",
  "authenticationToken": "loyalty-update-token"
}
```

### Multi-Day Event Pass
```json
{
  "passType": "eventTicket",
  "description": "Music Festival - 3 Day Pass",
  "relevantDate": "2024-07-15T12:00:00Z",
  "expirationDate": "2024-07-17T23:59:59Z",
  "primaryFields": [
    {
      "key": "festival",
      "value": "Summer Sounds 2024"
    }
  ],
  "barcodes": [
    {
      "message": "DAY1-FESTIVAL-ABC123",
      "format": "PKBarcodeFormatQR"
    },
    {
      "message": "DAY2-FESTIVAL-ABC123", 
      "format": "PKBarcodeFormatQR"
    },
    {
      "message": "DAY3-FESTIVAL-ABC123",
      "format": "PKBarcodeFormatQR"
    }
  ]
}
```

---

## 🎉 Ready to Build!

Your complete Apple Wallet pass generation system is ready. Use the dashboard at `/pass-builder` or integrate directly with the API endpoint at `/api/passes/universal/create`.

**Happy pass building! 🎫✨**
