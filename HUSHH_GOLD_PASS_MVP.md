# 🏆 Hushh Gold Pass MVP - Technical Implementation Plan

## 🎯 Product Overview
Frictionless membership system: **Name + Email + US Phone → Instant Gold Apple Wallet Pass → Profile Completion**

### Key Features
- ✅ **No Login Required** - Deterministic UID system
- ✅ **Gold Matte Pass** - Premium Apple Wallet design with "HUSHH" branding
- ✅ **QR Verification** - Points to hosted profile at `/u/{uid}`
- ✅ **US Profile Completion** - City, State, ZIP, Gender, Age
- ✅ **Single Document Storage** - Everything in `users/{uid}` Firestore doc

## 🏗 Architecture

### Data Model
```typescript
// Firestore: users/{uid}
interface User {
  uid: string
  identity: {
    name: string
    email: string
    phoneE164: string  // +1XXXXXXXXXX
  }
  profile?: {
    street1?: string
    city: string
    state: string      // 2-letter US state code
    zip: string        // NNNNN or NNNNN-NNNN
    gender: 'male' | 'female'
    age: number        // 13-120
  }
  links: {
    publicUrl: string     // https://hushh-wallet.vercel.app/u/{uid}
    profileUrl: string    // https://hushh-wallet.vercel.app/u/{uid}/complete?token={token}
  }
  tokens: {
    profileToken: string  // 32-hex random string
  }
  pass?: {
    serial?: string
    lastGeneratedAt?: timestamp
  }
  meta: {
    tier: 'gold'
    createdAt: timestamp
    lastSeenAt: timestamp
  }
}
```

### Core Routes
1. **`POST /api/claim`** - Landing form → Generate UID → Create/Update user → Return pass URL
2. **`GET /api/passes/gold?uid=...`** - Generate Apple Wallet pass (.pkpass)
3. **`POST /api/profile/complete`** - Complete profile with token auth
4. **`GET /u/{uid}`** - Public verification page
5. **`GET /u/{uid}/complete`** - Profile completion form

### UID Strategy
```typescript
// Deterministic UID generation
function generateUID(name: string, email: string, phone: string): string {
  const canonical = `${email.toLowerCase().trim()}|${normalizeUSPhone(phone)}|${name.trim()}`
  const hash = hmacSHA256(process.env.UID_SECRET!, canonical)
  return `hu_${base32encode(hash).slice(0, 12).toLowerCase()}`
}
```

## 🎨 Gold Pass Design Spec

### Visual Theme (Gold Matte)
- **Background**: `rgb(117, 65, 10)` (deep bronze/gold)
- **Foreground**: `rgb(255, 248, 235)` (cream text)
- **Labels**: `rgb(216, 178, 111)` (golden labels)

### Pass Structure
```json
{
  "passType": "storeCard",
  "description": "Hushh Gold Membership",
  "organizationName": "Hushh Technologies",
  "backgroundColor": "rgb(117, 65, 10)",
  "foregroundColor": "rgb(255, 248, 235)",
  "labelColor": "rgb(216, 178, 111)",
  "logoText": "HUSHH",
  "primaryFields": [
    {"key": "tier", "value": "GOLD MEMBER"}
  ],
  "secondaryFields": [
    {"key": "member_id", "label": "Member ID", "value": "{uid}"}
  ],
  "backFields": [
    {
      "key": "complete_profile",
      "label": "Complete Your Profile", 
      "value": "Tap to add your address and preferences:\n{profileUrl}"
    }
  ],
  "barcode": {
    "message": "https://hushh-wallet.vercel.app/u/{uid}",
    "format": "PKBarcodeFormatQR",
    "messageEncoding": "utf-8"
  },
  "sharingProhibited": true
}
```

## 📱 User Journeys

### A) Claim Gold Pass (Landing → Wallet)
1. **Landing Page**: Simple form with Name, Email, US Phone
2. **Submit**: `POST /api/claim` → UID generation → Firestore upsert
3. **Response**: `{uid, addToWalletUrl, profileUrl}`
4. **Add to Wallet**: Direct iOS/Safari integration

### B) QR Verification (`/u/{uid}`)
1. **QR Scan**: Opens public profile page
2. **Display**: Gold badge + name (no PII)
3. **CTA**: "Add to Apple Wallet" button

### C) Profile Completion (Bearer Token Auth)
1. **Pass Back Link**: Tap profile URL with embedded token
2. **Form**: US address fields (City, State, ZIP, Gender, Age)
3. **Submit**: Token verification → Profile merge → Success

## 🔒 Security & Privacy

### Data Protection
- **No Client Firestore Access**: All writes via Next.js API routes
- **Deterministic UIDs**: Same input → Same UID (idempotent)
- **Bearer Token Auth**: 128-bit random `profileToken` for profile completion
- **PII Minimization**: Public pages show minimal identity data
- **COPPA Compliance**: Age minimum 13, no DOB collection

### Validation
- **Email**: RFC basic validation, store lowercase
- **Phone**: US normalization (10/11 digits → `+1XXXXXXXXXX`)
- **State**: Strict US state codes (AL-WY, DC)
- **ZIP**: 5-digit or ZIP+4 format
- **Age**: 13-120 range

## 🚀 Implementation Status

### ✅ Completed Infrastructure
- Apple Wallet API (`https://hushh-wallet.vercel.app/api/passes/universal/create`)
- Clean domain alias (`hushh-wallet.vercel.app`)
- Comprehensive API documentation

### 🛠 To Implement
1. **Utility Functions** - UID generation, phone normalization, validation
2. **API Routes** - Claim, gold pass generation, profile completion  
3. **Frontend Pages** - Landing, verification, profile forms
4. **Firestore Integration** - User document CRUD operations
5. **Testing & QA** - End-to-end flow verification

## 📋 Implementation Checklist

- [ ] Create UID generation utilities
- [ ] Set up Firestore user model
- [ ] Implement `/api/claim` endpoint
- [ ] Implement `/api/passes/gold` endpoint  
- [ ] Implement `/api/profile/complete` endpoint
- [ ] Create landing page UI
- [ ] Create public verification page `/u/{uid}`
- [ ] Create profile completion page `/u/{uid}/complete`
- [ ] Add form validations
- [ ] Test complete user journey
- [ ] Deploy and verify on iOS devices

## 🎯 Success Metrics
- **Conversion Rate**: Landing → Pass Added to Wallet
- **Completion Rate**: Pass → Profile Completed
- **QR Verification**: Scan → Public Page Views
- **Error Rate**: Failed UID generation or pass creation

---

**Ready to implement the complete frictionless Gold Pass MVP! 🚀**
