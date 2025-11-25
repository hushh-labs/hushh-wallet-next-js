# 🎫 Hushh Wallet Integration
### The Next-Generation Digital Identity & Apple Wallet System

![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-shield?style=for-the-badge)

---

## 📋 Executive Summary

**Hushh Wallet Integration** is a sophisticated digital identity platform designed to bridge the gap between web applications and **Apple Wallet**. It introduces a privacy-first **Unified Hushh ID** system that consolidates personal identity and lifestyle preferences into a single, cryptographically secure digital card.

Beyond identity, the platform features a **Universal Pass Builder**, capable of generating any Apple Wallet pass type (Boarding Passes, Event Tickets, Coupons) via a single, unified API endpoint.

---

## 🚀 Key Features

### 🆔 Unified Hushh ID System
A revolutionary approach to digital identity that respects user privacy while providing utility.
*   **One Card, Multiple Facets**: Combines **Personal Identity** (Name, Age, Contact) and **Lifestyle Preferences** (Food, Cuisine, Dietary Restrictions) into a single `.pkpass` file.
*   **Granular Status Tracking**: Real-time dashboard tracks the completion status of each data section independently.
*   **Privacy-First Sharing**: Uses opaque `shareId`s to generate QR codes. No PII (Personally Identifiable Information) is ever exposed in the URL.
*   **Public Viewer**: A beautiful, sanitized web view for verifying identity and preferences without exposing raw data.

### 🏗️ Universal Pass Builder
A production-grade engine for generating Apple Wallet passes at scale.
*   **All Pass Types Supported**: Generic, Boarding Pass, Event Ticket, Store Card, Coupon.
*   **Rich Customization**: Full control over colors, branding, auxiliary fields, and back-of-pass content.
*   **Location Awareness**: GPS-triggered notifications when the pass is near a relevant location.
*   **Dynamic Barcodes**: Support for QR, PDF417, Aztec, and Code128 formats.

### 🔐 Enterprise-Grade Security
*   **Auth-less Tokenization**: Eliminates traditional passwords. Uses **256-bit Owner Tokens** stored in HttpOnly cookies and **BIP39 Recovery Phrases** for account access.
*   **Strict Access Control**: Firestore security rules block all client-side writes. Data integrity is enforced strictly by the server-side API.
*   **Token-Based User Lookup**: Securely identifies returning users via hashed token comparison, ensuring seamless sessions without explicit login.

---

## 🛠️ Technical Architecture

### Core Stack
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Database**: Firebase Firestore (NoSQL)
*   **Styling**: Tailwind CSS + CSS Modules
*   **Wallet Engine**: `passkit-generator` with custom certificate management

### Data Flow
1.  **User Input**: Data is collected via the secure Dashboard UI.
2.  **API Processing**: Requests are sent to `/api/cards/update`.
3.  **Token Verification**: The system verifies the `hushh_owner_token` cookie against the database hash.
4.  **Data Merging**: Personal and Food data are merged into a single `UserRecord`.
5.  **Pass Generation**: A signed `.pkpass` file is generated on-the-fly using Apple WWDR certificates.

---

## 📚 API Reference

### 1. Unified Card Management
**Endpoint**: `POST /api/cards/update`
Updates user data and merges it into the unified record.
```json
{
  "section": "personal", // or "food"
  "data": {
    "preferredName": "Alex",
    "legalName": "Alexander Hamilton",
    "dob": "1990-01-01",
    "phone": "+15550101"
  }
}
```

### 2. Universal Pass Creation
**Endpoint**: `POST /api/passes/universal/create`
Generates any type of Apple Wallet pass.
```json
{
  "passType": "eventTicket",
  "primaryFields": [{"key": "event", "value": "Hushh Summit"}],
  "barcode": {"message": "TICKET-123", "format": "PKBarcodeFormatQR"}
}
```

### 3. Pass Download
**Endpoint**: `GET /api/cards/download/[uid]`
Securely downloads the generated `.pkpass` file for the authenticated user.

---

## 💻 Local Development

### Prerequisites
*   Node.js 18+
*   Apple Developer Account (for Certificates)
*   Firebase Project

### Setup
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/hushh-labs/hushh-wallet-next-js.git
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Create a `.env.local` file with your Firebase and Apple Wallet credentials.
4.  **Add Certificates**:
    Place your `signerCert.pem`, `signerKey.pem`, and `wwdr.pem` in the project root.
5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

---

## 🔒 Security Model

### Firestore Rules
The database is secured with strict rules (`firestore.rules`):
*   **Users Collection**: `allow read, write: if false;` (Server-only access)
*   **Public Profiles**: `allow read: if true;` (Publicly accessible for QR scanning)
*   **Client Writes**: **BLOCKED**. All data mutation must occur via the secure API.

### Tokenization
*   **Owner Token**: A high-entropy random string acting as the session key.
*   **Recovery Phrase**: A 12-word mnemonic (BIP39) for account recovery.
*   **Share ID**: An opaque, rotatable identifier for public sharing links.

---

## 📄 License

Copyright © 2025 Hushh Labs. All rights reserved.
Private and Confidential.
