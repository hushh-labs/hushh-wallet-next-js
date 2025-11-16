# 🍎 Hushh Apple Wallet API - Complete Integration Guide

## 🎯 **Quick Start**
Hit this endpoint from any Hushh project to generate Apple Wallet passes instantly!

### 🌐 **Production Endpoint**
```
POST https://hushh-wallet.vercel.app/api/passes/universal/create
```

### 📱 **What You Get**
- **Instant `.pkpass` file download** - Ready for Apple Wallet
- **All Apple Wallet features** - QR codes, locations, notifications
- **6 Pre-built templates** - ID cards, boarding passes, tickets, etc.
- **Custom styling** - Colors, logos, branding

---

## 🚀 **Basic Usage Examples**

### **1. Simple ID Card (Minimal)**
```bash
curl -X POST "https://hushh-wallet.vercel.app/api/passes/universal/create" \
  -H "Content-Type: application/json" \
  -d '{
    "passType": "generic",
    "description": "Employee ID Card",
    "organizationName": "Hushh Technologies",
    "primaryFields": [
      {"key": "name", "label": "Name", "value": "Ankit Singh"}
    ],
    "barcode": {
      "message": "https://hushh.ai/verify/emp123",
      "format": "PKBarcodeFormatQR"
    }
  }' \
  -o "employee-id.pkpass"
```

### **2. Event Ticket (Rich)**
```bash
curl -X POST "https://hushh-wallet.vercel.app/api/passes/universal/create" \
  -H "Content-Type: application/json" \
  -d '{
    "passType": "eventTicket",
    "description": "Hushh Annual Conference 2024",
    "organizationName": "Hushh Technologies",
    "logoText": "HUSHH CONF",
    "backgroundColor": "rgb(26, 26, 46)",
    "foregroundColor": "rgb(255, 255, 255)",
    "primaryFields": [
      {"key": "event", "value": "HUSHH CONF 2024"}
    ],
    "secondaryFields": [
      {"key": "attendee", "label": "Attendee", "value": "Ankit Singh"},
      {"key": "seat", "label": "Seat", "value": "A15"}
    ],
    "barcode": {
      "message": "https://hushh.ai/event/check-in/HC2024-001",
      "format": "PKBarcodeFormatQR"
    },
    "locations": [
      {
        "latitude": 28.6139,
        "longitude": 77.2090,
        "relevantText": "Welcome to Hushh Conference!"
      }
    ]
  }' \
  -o "hushh-conf-ticket.pkpass"
```

---

## 🛠 **Complete API Reference**

### **Request Structure**
```typescript
interface UniversalPassRequest {
  // 🔰 REQUIRED FIELDS
  passType: "boardingPass" | "coupon" | "eventTicket" | "generic" | "storeCard"
  description: string                    // Pass title/description
  
  // 🎨 VISUAL DESIGN
  organizationName?: string              // Company/org name
  logoText?: string                      // Text on pass logo area
  backgroundColor?: string               // RGB format: "rgb(117, 65, 10)"
  foregroundColor?: string               // Text color: "rgb(255, 248, 235)"
  labelColor?: string                    // Label color: "rgb(216, 178, 111)"
  
  // 📝 PASS CONTENT (Arrays of field objects)
  primaryFields?: PassField[]            // Large, prominent fields
  secondaryFields?: PassField[]          // Important secondary info  
  auxiliaryFields?: PassField[]          // Additional details
  headerFields?: PassField[]             // Top section fields
  backFields?: PassField[]               // Detailed info on pass back
  
  // 📱 QR CODE / BARCODE
  barcode?: {
    message: string                      // QR content (URL, text, etc.)
    format: "PKBarcodeFormatQR" | "PKBarcodeFormatPDF417" | "PKBarcodeFormatAztec" | "PKBarcodeFormatCode128"
    messageEncoding?: string             // Default: "utf-8"
    altText?: string                     // Accessibility text
  }
  
  // 📍 LOCATION FEATURES
  locations?: {
    latitude: number                     // GPS coordinates
    longitude: number
    relevantText?: string                // Notification message when nearby
  }[]
  
  // 📅 DATE SETTINGS
  relevantDate?: string                  // ISO format: "2024-12-25T15:30:00"
  expirationDate?: string               // When pass expires
  
  // 🔧 ADVANCED FEATURES
  webServiceURL?: string                 // For pass updates
  authenticationToken?: string           // API authentication
  sharingProhibited?: boolean            // Prevent sharing (for IDs)
  voided?: boolean                       // Mark as invalid
}

interface PassField {
  key: string                           // Unique identifier
  label?: string                        // Display label
  value: string                         // Display value
  textAlignment?: "PKTextAlignmentLeft" | "PKTextAlignmentCenter" | "PKTextAlignmentRight"
}
```

---

## 📋 **6 Ready-to-Use Templates**

### **Template 1: Personal ID Card**
```json
{
  "passType": "generic",
  "description": "Personal ID Card",
  "organizationName": "Hushh Technologies",
  "logoText": "HUSHH",
  "backgroundColor": "rgb(117, 65, 10)",
  "foregroundColor": "rgb(255, 248, 235)",
  "primaryFields": [
    {"key": "name", "label": "Full Name", "value": "John Doe"}
  ],
  "secondaryFields": [
    {"key": "id", "label": "ID Number", "value": "HU123456"},
    {"key": "type", "label": "Type", "value": "Premium"}
  ],
  "barcode": {
    "message": "https://hushh.ai/verify/HU123456789",
    "format": "PKBarcodeFormatQR"
  }
}
```

### **Template 2: Flight Boarding Pass**
```json
{
  "passType": "boardingPass",
  "transitType": "PKTransitTypeAir",
  "description": "Flight Boarding Pass",
  "organizationName": "SkyLine Airways",
  "primaryFields": [
    {"key": "origin", "value": "DEL"},
    {"key": "destination", "value": "BOM"}
  ],
  "secondaryFields": [
    {"key": "flight", "label": "Flight", "value": "AI101"},
    {"key": "gate", "label": "Gate", "value": "B12"}
  ],
  "barcode": {
    "message": "https://airline.com/flight/AI101/ABC123",
    "format": "PKBarcodeFormatPDF417"
  }
}
```

### **Template 3: Event Ticket**
```json
{
  "passType": "eventTicket", 
  "description": "Tech Conference 2024",
  "backgroundColor": "rgb(26, 26, 46)",
  "primaryFields": [
    {"key": "event", "value": "TechConf 2024"}
  ],
  "secondaryFields": [
    {"key": "attendee", "label": "Attendee", "value": "Developer Name"},
    {"key": "tier", "label": "Access", "value": "VIP"}
  ],
  "barcode": {
    "message": "https://event.com/verify/VIP001",
    "format": "PKBarcodeFormatQR"
  }
}
```

### **Template 4: Loyalty Card**
```json
{
  "passType": "storeCard",
  "description": "Coffee Shop Loyalty",
  "backgroundColor": "rgb(139, 69, 19)",
  "primaryFields": [
    {"key": "points", "label": "Points", "value": "1,250"}
  ],
  "secondaryFields": [
    {"key": "status", "label": "Status", "value": "Gold Member"},
    {"key": "visits", "label": "Visits", "value": "47"}
  ],
  "barcode": {
    "message": "https://coffee.com/loyalty/member123",
    "format": "PKBarcodeFormatCode128"
  }
}
```

### **Template 5: Discount Coupon** 
```json
{
  "passType": "coupon",
  "description": "25% Off Everything", 
  "backgroundColor": "rgb(233, 30, 99)",
  "primaryFields": [
    {"key": "discount", "value": "25% OFF"}
  ],
  "secondaryFields": [
    {"key": "code", "label": "Code", "value": "SAVE25"},
    {"key": "valid", "label": "Valid Until", "value": "Dec 31, 2024"}
  ],
  "barcode": {
    "message": "https://store.com/coupon/SAVE25",
    "format": "PKBarcodeFormatQR"
  }
}
```

### **Template 6: Driver's License**
```json
{
  "passType": "generic",
  "description": "Driver's License",
  "organizationName": "Department of Motor Vehicles",
  "backgroundColor": "rgb(107, 115, 255)",
  "primaryFields": [
    {"key": "name", "label": "Name", "value": "Kelly G."}
  ],
  "secondaryFields": [
    {"key": "license_no", "label": "License No.", "value": "D123-456-789"},
    {"key": "class", "label": "Class", "value": "Class C"}
  ],
  "barcode": {
    "message": "https://dmv.gov/verify/DL123456789",
    "format": "PKBarcodeFormatQR"
  },
  "sharingProhibited": true
}
```

---

## 💻 **Programming Language Examples**

### **JavaScript/Node.js**
```javascript
const fetch = require('node-fetch');

async function createAppleWalletPass(passData) {
  const response = await fetch('https://hushh-wallet.vercel.app/api/passes/universal/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passData)
  });
  
  if (response.ok) {
    const passBuffer = await response.buffer();
    return passBuffer; // Save as .pkpass file
  }
  throw new Error('Pass creation failed');
}

// Usage
const employeePass = {
  passType: "generic",
  description: "Employee ID",
  primaryFields: [{ key: "name", label: "Name", value: "Ankit Singh" }],
  barcode: { message: "https://hushh.ai/employee/123", format: "PKBarcodeFormatQR" }
};

createAppleWalletPass(employeePass)
  .then(passBuffer => {
    // Save or send the pass file
    require('fs').writeFileSync('employee.pkpass', passBuffer);
  });
```

### **Python**
```python
import requests

def create_apple_wallet_pass(pass_data):
    url = "https://hushh-wallet.vercel.app/api/passes/universal/create"
    
    response = requests.post(url, json=pass_data)
    
    if response.ok:
        return response.content  # .pkpass file bytes
    else:
        raise Exception(f"Pass creation failed: {response.text}")

# Usage
employee_pass = {
    "passType": "generic",
    "description": "Employee ID", 
    "primaryFields": [{"key": "name", "label": "Name", "value": "Ankit Singh"}],
    "barcode": {"message": "https://hushh.ai/employee/123", "format": "PKBarcodeFormatQR"}
}

pass_bytes = create_apple_wallet_pass(employee_pass)
with open('employee.pkpass', 'wb') as f:
    f.write(pass_bytes)
```

### **PHP**
```php
<?php
function createAppleWalletPass($passData) {
    $url = 'https://hushh-wallet.vercel.app/api/passes/universal/create';
    
    $options = [
        'http' => [
            'header' => "Content-Type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($passData)
        ]
    ];
    
    return file_get_contents($url, false, stream_context_create($options));
}

$employeePass = [
    'passType' => 'generic',
    'description' => 'Employee ID',
    'primaryFields' => [['key' => 'name', 'label' => 'Name', 'value' => 'Ankit Singh']],
    'barcode' => ['message' => 'https://hushh.ai/employee/123', 'format' => 'PKBarcodeFormatQR']
];

$passBytes = createAppleWalletPass($employeePass);
file_put_contents('employee.pkpass', $passBytes);
?>
```

---

## 🎨 **Customization Guide**

### **Colors**
```json
{
  "backgroundColor": "rgb(117, 65, 10)",    // Background color
  "foregroundColor": "rgb(255, 248, 235)",  // Text color  
  "labelColor": "rgb(216, 178, 111)"        // Label color
}
```

### **QR Code Options**
```json
{
  "barcode": {
    "message": "https://your-site.com/verify/123",  // Can be URL, text, etc.
    "format": "PKBarcodeFormatQR",                   // QR | PDF417 | Aztec | Code128
    "messageEncoding": "utf-8"                      // Text encoding
  }
}
```

### **Location Notifications**
```json
{
  "locations": [
    {
      "latitude": 28.6139,                  // Delhi coordinates
      "longitude": 77.2090,
      "relevantText": "Welcome to Hushh HQ!" // Notification text
    }
  ]
}
```

---

## 🔍 **Common Use Cases**

| Use Case | Pass Type | Key Features |
|----------|-----------|--------------|
| **Employee ID** | `generic` | QR code with employee URL, company branding |
| **Event Tickets** | `eventTicket` | QR check-in, venue location, seating info |
| **Loyalty Cards** | `storeCard` | Points balance, member status, store locations |
| **Boarding Passes** | `boardingPass` | Flight info, gate notifications, seat details |
| **Coupons/Offers** | `coupon` | Discount codes, expiry dates, store locations |
| **Membership Cards** | `generic` | Member ID, access levels, renewal dates |

---

## ❗ **Error Handling**

### **Common Errors**
```json
// Missing required fields
{
  "success": false,
  "error": "Universal Pass generation failed", 
  "details": "passType is required"
}

// Invalid color format  
{
  "success": false,
  "error": "Invalid color format",
  "details": "Use rgb(r, g, b) format"
}
```

### **Success Response**
- **Content-Type**: `application/vnd.apple.pkpass`
- **Headers**: 
  - `Content-Disposition: attachment; filename="HushhPass-[ID].pkpass"`
  - `X-Pass-Serial`: Unique pass identifier
  - `X-Pass-Type`: Pass type used

---

## 🚀 **Production Integration Checklist**

- [ ] **Endpoint**: Using production URL
- [ ] **Error Handling**: Catch and handle API errors
- [ ] **File Handling**: Properly save/serve .pkpass files  
- [ ] **User Experience**: Show loading states during generation
- [ ] **Testing**: Test on actual iOS devices
- [ ] **Monitoring**: Track API usage and errors

---

## 🆘 **Quick Troubleshooting**

| Problem | Solution |
|---------|----------|
| **QR code not showing** | Check `barcode.messageEncoding` is "utf-8" |
| **Colors not applied** | Use rgb() format: `"rgb(255, 0, 0)"` |
| **Pass won't open** | Verify all required fields are present |
| **Location not working** | Check GPS coordinates are valid numbers |
| **API timeout** | Reduce field complexity or add retry logic |

---

## 📞 **Support & Contact**

- **API Documentation**: `/api/passes/universal/create` (GET for docs)
- **Live Dashboard**: Visit the pass builder for testing
- **GitHub**: [Hushh Wallet Repository](https://github.com/hushh-labs/hushh-wallet-next-js)

---

**🎉 Ready to integrate Apple Wallet into any Hushh project? Just copy the examples above and start creating passes!**
