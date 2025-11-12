# 🎫 HUSHH Wallet Integration - Unified ID Card System

## 📋 Project Overview

Modern Next.js application for creating and managing unified digital identity cards with seamless Apple Wallet integration. Features a privacy-first, auth-less tokenization system that combines personal identity and food preferences into a single elegant card.

## 🆔 **NEW: Unified Hushh ID Card System (100% Complete)**

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
POST /api/cards/update     # Update card sections incrementally
GET  /api/p/{shareId}      # QR resolution (public viewer)
GET  /api/cards/download/{uid}  # Download Apple Wallet pass
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
├── Personal Card → User fills personal data → Unified backend
├── Food Card → User fills food preferences → Unified backend
└── Complete Card → Full profile creation flow

Result: One "hushh ID Card" in Apple Wallet
```

### ✅ **What's Working Now (100% Complete)**

#### ✅ **Core Backend**
- Firebase integration with all collections
- Auth-less tokenization system 
- QR resolution API with privacy protection
- Data validation (phone E.164, DOB, payload structure)
- Incremental update API (/api/cards/update)

#### ✅ **User Experience**  
- Complete unified card creation flow
- Public viewer with sanitized data
- Recovery phrase system (12-word BIP39)
- Apple Wallet pass generation
- Direct form-to-generation flow (no preview step)

#### ✅ **Security & Privacy**
- No PII in QR codes or URLs
- HttpOnly cookie storage for tokens
- Server-side data sanitization
- Rate limiting and abuse prevention

#### ✅ **Wallet Integration**
- New "hushh ID CARD" pass template (luxury black + gold)
- PKPass generation with unified data
- QR codes embedded in pass
- Download integration working

#### ✅ **Dashboard Integration** 
Connected all card routes to unified backend:
```bash
✅ /cards/personal → /api/cards/update (saves personal data)
✅ /cards/food → /api/cards/update (saves food data)
✅ /cards/create → /api/cards/create (complete unified flow)
```

#### ✅ **Pass Download Integration**
Apple Wallet "Add to Wallet" button integrated in card creation flow.

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
│   │   │   ├── create/         # ✅ Unified card creation flow
│   │   │   ├── personal/       # ✅ Personal card flow (unified backend)
│   │   │   └── food/          # ✅ Food card flow (unified backend)
│   │   ├── p/[shareId]/       # ✅ Public QR viewer page
│   │   ├── api/
│   │   │   ├── cards/
│   │   │   │   ├── create/     # ✅ Unified card creation API
│   │   │   │   ├── update/     # ✅ Incremental update API
│   │   │   │   └── download/   # ✅ Pass download API
│   │   │   ├── p/[shareId]/   # ✅ QR resolution API  
│   │   │   └── passes/        # Legacy separate pass APIs
│   │   └── globals.css        # Global styles & design system
│   ├── components/            # Reusable React components
│   ├── lib/
│   │   ├── firebase.ts        # ✅ Firebase configuration
│   │   ├── firestore.ts       # ✅ Database operations
│   │   ├── tokenization.ts    # ✅ Auth-less token management
│   │   └── hushhIdPassGenerator.ts # ✅ Unified pass generation
│   └── types/                 # TypeScript definitions
├── passModels/
│   ├── hushhid.pass/         # ✅ Unified card template
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

### Test Incremental Updates:
```bash
# 1. Test personal data only
open http://localhost:3000/cards/personal
# Fill form → Check if data saves to unified backend

# 2. Test food data only  
open http://localhost:3000/cards/food
# Fill form → Check if data saves to unified backend

# 3. Test Apple Wallet download
# Complete either flow → Click "Add to Apple Wallet"
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

### Incremental Updates
```bash
POST /api/cards/update
Content-Type: application/json

{
  "section": "personal", // or "food"
  "data": {
    "preferredName": "John",
    "legalName": "John Doe",
    "phone": "+1234567890",
    "dob": "1990-01-01",
    "gender": "male"
  }
}

# Response:
{
  "success": true,
  "data": {
    "uid": "user-123",
    "section": "personal",
    "isComplete": true, // true if both personal + food completed
    "shareUrl": "https://hushh.ai/p/share-789",
    "hasPass": true // true if pass generated
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
- **Personal Card**: `https://hushh-wallet-app.vercel.app/cards/personal`
- **Food Card**: `https://hushh-wallet-app.vercel.app/cards/food`
- **Public QR Viewer**: `https://hushh-wallet-app.vercel.app/p/{shareId}`

### 🎉 Current Status

**✅ Production Ready - 100% Complete:**
- ✅ Complete auth-less tokenization system
- ✅ Unified card creation flow with recovery phrases
- ✅ Privacy-first QR system with public viewer  
- ✅ Apple Wallet pass generation working
- ✅ Firebase backend with data sanitization
- ✅ Dashboard integration complete (all routes unified)
- ✅ Pass download integration working
- ✅ End-to-end testing verified
- ✅ React hooks and state management implemented
- ✅ Production deployment active

**🎯 System Highlights:**
- **One Card System**: Single unified "hushh ID Card" containing personal + food data
- **Auth-less Security**: Complete tokenization without traditional login
- **Privacy-First QR**: No PII exposure in shareable links  
- **Apple Wallet Ready**: Real .pkpass generation with certificates
- **Production Scale**: Firebase backend, Vercel deployment, auto-scaling

---

**Ready for production use!** 🚀

**Latest Features:**
- ✅ Streamlined personal card flow (direct form-to-generation)
- ✅ Complete hooks implementation with proper state management
- ✅ End-to-end API testing completed
- ✅ Firebase data persistence verified
- ✅ QR code generation and public profiles working
