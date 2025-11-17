# HUSHH Gold Pass MVP

A complete **Supabase-first** implementation of the HUSHH Gold Pass system with deterministic UID generation, Apple Wallet integration, and profile completion flow.

## 🎯 Live Demo

- **Production URL**: https://hushh-gold-pass-mvp.vercel.app
- **QR Verification**: `/u/{uid}` (scanned from wallet passes)
- **Profile Completion**: `/complete/{uid}?token=...` (linked from pass back)

## 🏗 Architecture Overview

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Wallet Integration**: Hushh Wallet API for Apple Wallet passes
- **Identity**: Deterministic UID generation (salted HMAC)
- **Security**: Token-based profile completion, rate limiting
- **Deployment**: Vercel with environment variables

## 📋 Features

### Core Flow
1. **Claim Pass**: 3-field form (Name, Email, US Phone) → deterministic UID
2. **Generate Wallet Pass**: Apple Wallet pass with QR code and profile completion link
3. **QR Verification**: Instant member verification at point-of-use
4. **Profile Completion**: Secure token-based US address collection

### Security & Privacy
- **Deterministic Identity**: Same inputs = same UID (prevents duplicates)
- **PII Protection**: QR verification shows minimal info (name, status only)
- **Rate Limiting**: IP-based limits on pass claims
- **Token Security**: Hashed tokens for profile completion
- **RLS**: Database-level security with service-role-only access

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account with project
- Access to Hushh Wallet API

### Installation

```bash
cd hushh-gold-pass-mvp
npm install
```

### Environment Setup

Copy `.env.local` and configure:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://hushh-gold-pass-mvp.vercel.app
UID_SECRET_SALT=your_secure_random_salt

# Hushh Wallet API
HUSHH_WALLET_API_URL=https://hushh-wallet.vercel.app/api/passes/universal/create
```

### Database Setup

Run the migration to create the proper schema:

```bash
# Apply the database migrations
cd supabase
supabase db reset
```

Or manually run the SQL in `supabase/migrations/002_create_proper_schema.sql`

### Development

```bash
npm run dev
```

Visit http://localhost:3000

## 📊 Database Schema

### `public.members`
- **Primary identity & profile storage**
- Deterministic UID as primary key
- Edit tokens for secure profile updates
- Pass status and metadata

### `public.pass_events`
- **Audit log for all events**
- Tracks claim submissions, pass generations, QR scans, profile updates
- UTM and metadata storage

### `public.rate_limits`
- **IP-based rate limiting**
- Prevents abuse of claim endpoint

## 🔌 API Endpoints

### `POST /api/claim`
**Claim a Gold Pass**
- Input: `{name, email, phone}`
- Output: `{uid, addToWalletUrl, profileUrl}`
- Features: Rate limiting, deterministic UID, duplicate handling

### `GET /api/passes/gold?uid={uid}`
**Generate Apple Wallet Pass**
- Calls Hushh Wallet API with royal gold design
- Streams `.pkpass` file for iOS download
- Updates pass serial and logs events

### `GET /u/{uid}`
**QR Verification Endpoint**
- Returns HTML (browser) or JSON (API)
- Shows member status and validity
- Logs scan events with metadata

### `POST /api/profile/complete`
**Profile Completion**
- Input: `{uid, token, city, state, zip, gender, age, street1?}`
- Validates US address format and age requirements
- Updates member profile securely

## 🎨 Design System

### Royal Gold Theme
- **Primary**: `rgb(117, 65, 10)` - Deep royal gold
- **Accent**: `rgb(216, 178, 111)` - Gold highlights
- **Text**: `rgb(255, 248, 235)` - Light cream

### Apple Wallet Pass
- **Type**: Store Card (membership)
- **Header**: Right-aligned "HUSHH" branding
- **QR Code**: Points to `/u/{uid}` for verification
- **Back Link**: Profile completion URL with secure token

## 🔒 Security Features

### Identity Protection
- **Deterministic UIDs**: Prevent duplicate accounts
- **Salted HMAC**: Non-guessable, consistent generation
- **Token Hashing**: Profile tokens stored as SHA-256 hashes

### Rate Limiting
- **10 claims per IP per hour**
- **Automatic bucket management**
- **Graceful degradation on errors**

### Data Privacy
- **Minimal QR data**: Name and status only
- **RLS enforcement**: Database-level access control
- **PII-safe verification**: No email/phone exposure

## 🚀 Deployment

### Vercel Deployment
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=@supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=@supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=@supabase_service_role_key
UID_SECRET_SALT=@uid_secret_salt
HUSHH_WALLET_API_URL=@hushh_wallet_api_url
NEXT_PUBLIC_APP_URL=@app_url
```

## 📈 Analytics & Monitoring

### Event Tracking
All events logged in `pass_events` table:
- `claim_submitted` - New pass requests
- `pass_issued` - Successful wallet pass generation
- `qr_scanned` - Verification scans
- `profile_opened/saved` - Profile completion events
- `api_error` - Error tracking with metadata

### Metrics Dashboard
Query `pass_events` for:
- **Conversion funnel**: Claim → Pass → Wallet → Profile
- **Channel attribution**: UTM parameter tracking
- **Success rates**: Pass generation and profile completion
- **Error monitoring**: API failures and user issues

## 🛠 Development Guide

### Adding New Features
1. **API Routes**: Add to `src/app/api/`
2. **Database**: Create migrations in `supabase/migrations/`
3. **Components**: Add to `src/app/` for pages, `src/components/` for reusable UI
4. **Styling**: Use Tailwind classes, extend `globals.css` if needed

### Testing
```bash
npm run type-check  # TypeScript validation
npm run build      # Production build test
npm run lint       # ESLint checks
```

### Local Database
```bash
supabase start     # Start local instance
supabase db reset  # Apply migrations
supabase studio    # Database UI
```

## 📋 User Stories Implementation

### US-01: Web Claim (iOS Safari)
✅ **Implemented**: 3-field form with < 4s response time

### US-02: Email/SMS Distribution  
✅ **Ready**: Pass URLs work across all channels

### US-03: QR Verification
✅ **Implemented**: `/u/{uid}` with <1.5s response time

### US-04: Profile Completion
✅ **Implemented**: Secure token-based US address collection

### US-05: Rate Limiting
✅ **Implemented**: IP-based limits with graceful handling

## 🎯 Success Metrics (30-day targets)

- **Claim → Wallet Add**: ≥ 60% (iOS Safari)
- **Time-to-Wallet (p75)**: ≤ 4 seconds  
- **Profile Completion (7d)**: ≥ 40%
- **QR Verify Uptime**: > 99.9%
- **API Failure Rate**: < 1%

## 🔧 Troubleshooting

### Common Issues

**Build Failures**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**Database Connection**
- Verify Supabase URLs and keys
- Check RLS policies are applied
- Ensure service role key has proper permissions

**Wallet Pass Generation**
- Verify Hushh Wallet API is accessible
- Check pass payload format
- Review API response headers for serial numbers

### Logs & Debugging
- **Vercel Functions**: Check function logs in Vercel dashboard
- **Supabase**: Use database logs and real-time subscriptions
- **Client-side**: Browser developer tools for frontend issues

## 📞 Support

For technical issues or questions:
1. Check this README and code comments
2. Review Supabase logs and Vercel function logs
3. Validate environment variables and API connectivity
4. Test individual API endpoints with curl or Postman

---

## Architecture Decisions

### Why Supabase?
- **Real-time capabilities** for future enhancements
- **Built-in auth** for admin features later
- **Row Level Security** for data protection
- **Simple scaling** without infrastructure management

### Why Deterministic UIDs?
- **Prevents duplicates** across all channels
- **Consistent identity** for returning users
- **No need for complex deduplication**
- **Scalable across distributed systems**

### Why Single Table?
- **MVP simplicity** - fewer joins, faster queries
- **Easy to audit** - all member data in one place
- **Future flexibility** - can normalize later if needed

Built with ❤️ for HUSHH Gold Pass members.
