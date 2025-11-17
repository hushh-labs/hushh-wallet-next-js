import { createHmac, randomBytes, createHash } from 'crypto';

// Types for identity data
export interface IdentityInput {
  name: string;
  email: string;
  phone: string;
}

export interface CanonicalIdentity {
  name: string;
  email: string;
  phone_e164: string;
}

// Phone number validation and normalization
export function normalizeUSPhone(phone: string): string | null {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle different US phone formats
  if (digits.length === 10) {
    // 10 digits: XXXXXXXXXX -> +1XXXXXXXXXX
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // 11 digits starting with 1: 1XXXXXXXXXX -> +1XXXXXXXXXX
    return `+1${digits.substring(1)}`;
  }
  
  // Invalid format
  return null;
}

// Email validation (basic)
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Name validation
export function validateName(name: string): boolean {
  return name.trim().length > 0;
}

// Canonicalize identity inputs
export function canonicalizeIdentity(input: IdentityInput): CanonicalIdentity | null {
  const email = input.email.toLowerCase().trim();
  const name = input.name.trim().replace(/\s+/g, ' '); // Collapse multiple spaces
  const phone_e164 = normalizeUSPhone(input.phone);
  
  // Validate inputs
  if (!validateEmail(email)) return null;
  if (!validateName(name)) return null;
  if (!phone_e164) return null;
  
  return {
    name,
    email,
    phone_e164
  };
}

// Generate deterministic UID from canonical identity
export function generateUID(canonical: CanonicalIdentity): string {
  const secret = process.env.UID_SECRET_SALT;
  if (!secret) {
    throw new Error('UID_SECRET_SALT environment variable is required');
  }
  
  // Create input string for hashing (email|phone|name_lowercase)
  const nameForHashing = canonical.name.toLowerCase();
  const input = `${canonical.email}|${canonical.phone_e164}|${nameForHashing}`;
  
  // Generate HMAC-SHA256
  const hmac = createHmac('sha256', secret);
  hmac.update(input);
  const hash = hmac.digest();
  
  // Take first 20 bytes and convert to base36
  const truncated = hash.subarray(0, 20);
  
  // Convert to big integer and then to base36
  let bigInt = 0n;
  for (let i = 0; i < truncated.length; i++) {
    bigInt = (bigInt << 8n) + BigInt(truncated[i]);
  }
  
  return bigInt.toString(36);
}

// Generate random token for profile completion (shorter to avoid Apple Wallet line breaks)
export function generateEditToken(): string {
  return randomBytes(8).toString('hex'); // 64-bit token (16 chars)
}

// Hash edit token for storage
export function hashEditToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Verify edit token
export function verifyEditToken(token: string, hash: string): boolean {
  return hashEditToken(token) === hash;
}

// Generate URLs for member
export function generateMemberUrls(uid: string, editToken: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hushh-gold-pass-mvp.vercel.app';
  
  return {
    public_url: `${baseUrl}/u/${uid}`,
    profile_url: `${baseUrl}/complete/${uid}?token=${editToken}`
  };
}
