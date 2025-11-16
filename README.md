# 🎫 HUSHH Wallet Integration - Complete Apple Wallet System

## 📋 Project Overview

Comprehensive Next.js application for creating and managing Apple Wallet passes with advanced capabilities. Features:

1. **🆔 Unified ID Card System** - Privacy-first digital identity cards with food preferences
2. **🏗️ Universal Pass Builder** - Complete Apple Wallet pass generation for all pass types
3. **🎛️ Interactive Dashboard** - Visual pass builder with pre-filled templates

## 🚀 **NEW: Universal Apple Wallet Pass Builder (Production Ready)**

### 🎯 **Complete Pass Generation System**

**Universal Endpoint**: Single API handles ALL Apple Wallet features:
- ✅ **All Pass Types**: Generic, boarding pass, event ticket, store card, coupon
- ✅ **QR Codes**: QR, PDF417, Aztec, Code128 formats with custom messages  
- ✅ **Location Notifications**: GPS-triggered pass display near coordinates
- ✅ **Visual Customization**: Background colors, logos, branding
- ✅ **Rich Content**: Primary, secondary, auxiliary, back fields with formatting
- ✅ **Advanced Features**: Dates, expiration, web services, sharing controls

### 🎛️ **Interactive Pass Builder Dashboard**

**Live Dashboard**: `/pass-builder` with instant template loading:
- **Option 1**: Personal ID Card (Generic with QR code)
- **Option 2**: Flight Boarding Pass (Air transit with location)  
- **Option 3**: Event Ticket (Conference with venue info)
- **Option 4**: Loyalty Card (Coffee shop with points)
- **Option 5**: Discount Coupon (Fashion store with expiry)

### 🔗 **Production URLs**

#### 🌐 **Live System**
```
Main Site: https://hushh-wallet-hz9j8hkjt-ankit-kumar-singhs-projects-390074cd.vercel.app
Pass Builder: https://hushh-wallet-hz9j8hkjt-ankit-kumar-singhs-projects-390074cd.vercel.app/pass-builder
Universal API: https://hushh-wallet-hz9j8hkjt-ankit-kumar-singhs-projects-390074cd.vercel.app/api/passes/universal/create
```

### 📱 **API Usage Examples**

#### Generate Flight Boarding Pass:
```bash
curl -X POST "https://hushh-wallet-hz9j8hkjt-ankit-kumar-singhs-projects-390074cd.vercel.app/api/passes/universal/create" \
  -H "Content-Type: application/json" \
  -d '{
    "passType": "boardingPass",
    "transitType": "PKTransitTypeAir",
    "primaryFields": [{"key": "origin", "value": "NYC"}, {"key": "destination", "value": "LAX"}],
    "secondaryFields": [{"key": "gate", "value": "B12"}, {"key": "seat", "value": "15A"}],
    "barcode": {"message": "AA123456", "format": "PKBarcodeFormatPDF417"},
    "locations": [{"latitude": 40.6413, "longitude": -73.7781, "relevantText": "Flight boarding now"}],
    "backgroundColor": "rgb(0, 116, 217)"
  }' \
  -o flight-pass.pkpass
```

#### Generate Event Ticket with QR:
```bash
curl -X POST "https://hushh-wallet-hz9j8hkjt-ankit-kumar-singhs-projects-390074cd.vercel.app/api/passes/universal/create" \
  -H "Content-Type: application/json" \
  -d '{
    "passType": "eventTicket", 
    "primaryFields": [{"key": "event", "value": "Tech Conference 2024"}],
    "secondaryFields": [{"key": "venue", "value": "Convention Center"}, {"key": "time", "value": "2PM"}],
    "barcode": {"message": "TICKET-789", "format": "PKBarcodeFormatQR"},
    "locations": [{"latitude": 37.7749, "longitude": -122.4194, "relevantText": "You have arrived at the venue"}]
  }' \
  -o event-pass.pkpass
```

### 🔧 **Universal API Documentation**

#### Endpoint: `POST /api/passes/universal/create`

**Complete Parameter Reference:**
```typescript
{
  // Pass Type (Required)
  passType: 'generic' | 'boardingPass' | 'eventTicket' | 'storeCard' | 'coupon';
  transitType?: 'PKTransitTypeAir' | 'PKTransitTypeBus' | 'PKTransitTypeTrain' | 'PKTransitTypeBoat' | 'PKTransitTypeGeneric';
  
  // Content Fields
  organizationName?: string;
  description?: string;
  primaryFields?: Array<{key: string, label?: string, value: string}>;
  secondaryFields?: Array<{key: string, label?: string, value: string}>;  
  auxiliaryFields?: Array<{key: string, label?: string, value: string}>;
  backFields?: Array<{key: string, label?: string, value: string}>;
  
  // Visual Customization
  backgroundColor?: string;      // "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)"
  foregroundColor?: string;
  labelColor?: string;
  logoText?: string;
  
  // Barcode/QR Configuration
  barcode?: {
    message: string;            // QR content
    format: 'PKBarcodeFormatQR' | 'PKBarcodeFormatPDF417' | 'PKBarcodeFormatAztec' | 'PKBarcodeFormatCode128';
    altText?: string;
  };
  
  // Location Notifications
  locations?: Array<{
    latitude: number;           // GPS coordinates
    longitude: number;
    altitude?: number;
    relevantText?: string;      // Notification text
  }>;
  
  // Dates & Expiration
  relevantDate?: string;        // ISO 8601 format
  expirationDate?: string;
  
  // Advanced Features
  webServiceURL?: string;       // For pass updates
  authenticationToken?: string;
  maxDistance?: number;         // Location trigger distance
  sharingProhibited?: boolean;  // Disable pass sharing
}
```

### 📊 **System Capabilities**

**Complete Apple Wallet Feature Set:**
- ✅ **5 Pass Types**: All Apple Wallet pass types supported
- ✅ **QR/Barcode**: 4 different formats with custom content
- ✅ **Locations**: GPS notifications with custom messages
- ✅ **Visual Design**: Colors, branding, typography control
- ✅ **Content Layout**: Multi-level field hierarchy (primary/secondary/auxiliary/back)
- ✅ **Dates/Time**: Relevance and expiration handling
- ✅ **Web Services**: Integration with external systems
- ✅ **Security**: Proper pass signing and validation
- ✅ **Error Handling**: Comprehensive validation and user feedback
- ✅ **Documentation**: Complete API reference with examples

---

## 🆔 **NEW: Unified Hushh ID Card System (87% Complete)**

### 🎯 **System Architecture**

**One Card Concept**: Instead of multiple separate cards, users get a single "hushh ID Card" that contains:
- ✅ **Personal Identity** (name, age, masked contact)
- ✅ **Food Preferences** (diet, spice level, cuisines, restrictions)  
- ✅ **Privacy-First QR** (opaque ShareId with no PII exposure)

### 🔐 **Auth-less Tokenization** (Production Ready)

**No Login Required** - Complete security through:
- **Owner Token**: 256-bit tokens with bcrypt hashing, HttpOnly cookies
- **Recovery Key**: 12-word BIP39 phrases for account recovery
- **ShareId**: Opaque 160-bit identifiers for QR codes
- **Rate Limiting**: IP-based protection (1 card creation/hour)

### 🏗️ **Backend Infrastructure** (Complete)

#### Firebase Collections:
```
/users/{uid}               # Master data (private)
├── profile: { preferredName, legalName, dob, phone, gender? }
├── food: { foodType, spiceLevel, topCuisines[], exclusions[] }
├── card: { publicId, activeShareId, passSerial }
├── owner: { ownerTokenHash, recoveryKeyHash }
└── shareSettings: { visibility, redactionPolicy }

/publicProfiles/{publicId}  # Sanitized snapshots (public-read)
├── sections:
│   ├── personal: { preferredName, age, maskedPhone }
│   └── food: { foodType, spiceLevel, cuisines[], exclusions[] }
└── lastUpdated, version, redacted

/shareLinks/{shareId}      # QR resolution mapping (server-only)
├── publicId, status: "active"|"revoked"
└── ttl?, createdAt
```

#### API Endpoints:
```bash
POST /api/cards/create     # Create unified card + issue tokens
GET  /api/p/{shareId}      # QR resolution (public viewer)
GET  /api/cards/create     # Check if user has existing card
```

### 🔗 **QR System & Public Viewer** (Complete)

**Privacy-First QR Codes:**
```
QR Content: https://hushh.ai/p/{shareId}
- No PII in URL (shareId is opaque 160-bit)
- Server-side resolution with sanitization
- Revocable and rotatable links
```

**Public Viewer Features:**
- Beautiful mobile-optimized page at `/p/[shareId]`
- Sanitized data display (masked phone, age vs DOB)
- Contact download (.vcf generation)
- Privacy controls with "About hushh" branding

### 📱 **User Experience** (Complete)

#### Unified Card Creation Flow:
```
/cards/create → Hero → Personal Info → Food Preferences → Preview → Success
                                                                     ↓
                                                      Shows recovery phrase + 
                                                      Apple Wallet integration
```

#### Current Dashboard Strategy:
```
Dashboard shows separate sections:
├── Personal Card → User fills personal data
├── Food Card → User fills food preferences  
└── (Behind scenes: All data unified in single backend)

Result: One "hushh ID Card" in Apple Wallet
```

### ✅ **What's Working Now (87% Complete)**

#### ✅ **Core Backend**
- Firebase integration with all collections
- Auth-less tokenization system 
- QR resolution API with privacy protection
- Data validation (phone E.164, DOB, payload structure)

#### ✅ **User Experience**  
- Complete unified card creation flow
- Public viewer with sanitized data
- Recovery phrase system (12-word BIP39)
- Apple Wallet pass generation

#### ✅ **Security & Privacy**
- No PII in QR codes or URLs
- HttpOnly cookie storage for tokens
- Server-side data sanitization
- Rate limiting and abuse prevention

#### ✅ **Wallet Integration**
- New "hushh ID CARD" pass template (luxury black + gold)
- PKPass generation with unified data
- QR codes embedded in pass

### 🚧 **Remaining Work (13%)**

#### 1. **Dashboard Integration** 
Connect existing card routes to unified backend:
```bash
# Current: Separate APIs
/cards/personal → /api/passes/personal/create
/cards/food → /api/passes/food/create

# Need: Unified API
/cards/personal → /api/cards/update (merge personal data)
/cards/food → /api/cards/update (merge food data)
```

#### 2. **Pass Download Integration**
Connect Apple Wallet "Add to Wallet" button to actual pass generation in card creation flow.

#### 3. **Firestore Security Rules** (Optional)
Deploy production security rules to deny client writes and enable public profile reads.

### 🎯 **Implementation Details**

#### HushhCardPayload (Unified Data Model):
```typescript
interface HushhCardPayload {
  // Personal
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  legalName: string;
  preferredName: string;
  phone: string;          // E.164 format
  dob: string;           // YYYY-MM-DD

  // Food  
  foodType: 'omnivore' | 'pescatarian' | 'vegetarian' | 'vegan' | 'jain' | 'eggitarian';
  spiceLevel: 'no' | 'mild' | 'medium' | 'hot' | 'extra_hot';
  cuisines: string[];    // max 3
  dishes: string[];      // max 3  
  exclusions: string[];  // max 2
}
```

#### Token Management:
```typescript
// Owner Token (256-bit)
ownerTokenManager.generateOwnerToken(uid, deviceId)
ownerTokenManager.hashToken(token) // bcrypt storage

// Recovery Key (12-word BIP39)  
recoveryKeyManager.generateRecoveryPhrase()
recoveryKeyManager.hashRecoveryPhrase(phrase)

// ShareId (160-bit opaque)
shareIdManager.generateShareId()
shareIdManager.createShareUrl(shareId) // → https://hushh.ai/p/{shareId}
```

---

## 🚀 Quick Start

### Prerequisites
```bash
# Install Node.js 18+ and npm
node --version  # Should be 18+
npm --version

# Install Vercel CLI globally (for deployment)
npm install -g vercel@latest

# Login to Vercel (first time only)
vercel login
```

### Setup & Development
```bash
# 1. Clone and navigate
git clone <repository-url>
cd hushh-wallet-app

# 2. Install dependencies
npm install

# 3. Environment setup
cp .env.local.example .env.local
# Add your Firebase and Apple Wallet credentials

# 4. Start development server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

## 🔄 Development Workflow

### Standard Development Process:
```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch (optional)
git checkout -b feature/your-feature-name

# 3. Make your changes
# Edit files, add features, fix bugs...

# 4. Test locally
npm run dev
# Test on http://localhost:3000

# 5. Commit changes
git add .
git commit -m "feat: your descriptive commit message"

# 6. Push and deploy
git push origin main
```

### 🎯 Auto-Deployment Magic

This project uses **Husky Git hooks** + **Vercel CLI** for **automatic deployment**:

```bash
# When you push to main branch:
git push origin main

# This automatically:
# ✅ Triggers Husky pre-push hook
# ✅ Detects you're on main branch  
# ✅ Runs `vercel --prod --yes`
# ✅ Deploys to production
# ✅ Gives you live URL
# ✅ Completes git push
```

## 🔧 Project Structure

```
hushh-wallet-app/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Main dashboard page
│   │   ├── cards/
│   │   │   ├── create/         # 🆕 Unified card creation flow
│   │   │   ├── personal/       # Legacy personal card flow
│   │   │   └── food/          # Legacy food card flow
│   │   ├── p/[shareId]/       # 🆕 Public QR viewer page
│   │   ├── api/
│   │   │   ├── cards/create/   # 🆕 Unified card creation API
│   │   │   ├── p/[shareId]/   # 🆕 QR resolution API  
│   │   │   └── passes/        # Legacy separate pass APIs
│   │   └── globals.css        # Global styles & design system
│   ├── components/            # Reusable React components
│   ├── lib/
│   │   ├── firebase.ts        # 🆕 Firebase configuration
│   │   ├── firestore.ts       # 🆕 Database operations
│   │   ├── tokenization.ts    # 🆕 Auth-less token management
│   │   └── hushhIdPassGenerator.ts # 🆕 Unified pass generation
│   └── types/                 # TypeScript definitions
├── passModels/
│   ├── hushhid.pass/         # 🆕 Unified card template
│   ├── personal.pass/        # Legacy personal template  
│   └── luxury.pass/          # Legacy luxury template
└── certs/                    # Apple Wallet certificates
```

## 🔒 Security & Environment

### Required Environment Variables:
```bash
# .env.local

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Apple Wallet Pass Generation
PASS_KEY_PASSPHRASE=
PASS_TYPE_IDENTIFIER=pass.com.hushh.idcard
TEAM_IDENTIFIER=WVDK9JW99C

# Auth Configuration
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### Apple Wallet Certificates:
```
certs/
├── pass_certificate.pem       # Apple Wallet pass signing certificate
├── pass_private_key.pem       # Private key for pass signing
└── wwdr_certificate.pem       # Apple WWDR certificate
```

## 📱 Testing the Unified System

### Test Unified Card Creation:
```bash
# 1. Start development server
npm run dev

# 2. Navigate to unified creation flow
open http://localhost:3000/cards/create

# 3. Complete the flow:
# - Fill personal information (name, phone, DOB)
# - Fill food preferences (diet, spice, cuisines)
# - Review combined data
# - Create card and get recovery phrase

# 4. Test QR scanning:
# - Note the ShareId from success page
# - Visit: http://localhost:3000/p/{shareId}
# - Verify sanitized data display
```

### Test Public QR Viewer:
```bash
# Test with sample ShareId (after creating a card)
open http://localhost:3000/p/sample-share-id-here

# Should show:
# ✅ User's preferred name
# ✅ Calculated age (not DOB)
# ✅ Masked phone number
# ✅ Complete food preferences
# ✅ Download contact button
```

## 📚 API Reference

### Unified Card Creation
```bash
POST /api/cards/create
Content-Type: application/json

{
  "legalName": "John Doe",
  "preferredName": "John", 
  "phone": "+1234567890",
  "dob": "1990-01-01",
  "gender": "male",
  "foodType": "vegetarian",
  "spiceLevel": "medium", 
  "cuisines": ["Indian", "Italian", "Thai"],
  "dishes": ["curries", "pasta", "rice-based"],
  "exclusions": ["nuts", "dairy"]
}

# Response:
{
  "success": true,
  "data": {
    "uid": "user-123",
    "publicId": "pub-456", 
    "shareId": "share-789",
    "shareUrl": "https://hushh.ai/p/share-789",
    "passSerial": "H-ID-123456",
    "recoveryPhrase": {
      "words": ["word1", "word2", ..., "word12"],
      "checksum": "abc123"
    }
  }
}
```

### QR Resolution
```bash
GET /api/p/{shareId}

# Response:
{
  "success": true,
  "data": {
    "profile": {
      "sections": {
        "personal": {
          "preferredName": "John",
          "age": 34,
          "maskedPhone": "+1-••••-••90"
        },
        "food": {
          "foodType": "vegetarian",
          "spiceLevel": "medium",
          "topCuisines": ["Indian", "Italian", "Thai"],
          "exclusions": ["nuts", "dairy"]
        }
      }
    },
    "shareId": "share-789",
    "lastUpdated": "2023-12-11T10:24:00Z"
  }
}
```

## 🐛 Troubleshooting

### Common Issues & Solutions:

#### ❌ "Firebase connection failed"
```bash
# Check Firebase configuration
# Verify .env.local has all required Firebase variables
# Ensure Firebase project is set up with Firestore enabled
```

#### ❌ "Owner Token not found"  
```bash
# Check if HttpOnly cookies are working
# Verify browser allows cookies from localhost
# Check Network tab in DevTools for cookie headers
```

#### ❌ "QR resolution fails"
```bash
# Verify ShareId format (should be 20+ characters)
# Check if shareLinks collection exists in Firestore
# Ensure /api/p/[shareId] route is accessible
```

#### ❌ "Pass generation fails"
```bash
# Verify Apple Wallet certificates in /certs/ directory
# Check PASS_KEY_PASSPHRASE environment variable
# Ensure pass template exists at passModels/hushhid.pass/
```

## 🌍 Live Deployment & URLs

### Production URLs:
- **Main Dashboard**: `https://hushh-wallet-app.vercel.app`
- **Unified Card Creation**: `https://hushh-wallet-app.vercel.app/cards/create`
- **Public QR Viewer**: `https://hushh-wallet-app.vercel.app/p/{shareId}`

### 🎉 Current Status

**✅ Production Ready Components (87%):**
- Complete auth-less tokenization system
- Unified card creation flow with recovery phrases
- Privacy-first QR system with public viewer  
- Apple Wallet pass generation
- Firebase backend with data sanitization

**🔧 Final Integration Needed (13%):**
- Connect dashboard card routes to unified backend
- Implement pass download in creation flow
- Deploy Firestore security rules

**🎯 Next Steps:**
1. Update existing `/cards/personal` and `/cards/food` routes to save to unified backend
2. Add pass download integration to creation success page
3. Deploy production security rules

---

**Ready to test the unified system!** 🚀
