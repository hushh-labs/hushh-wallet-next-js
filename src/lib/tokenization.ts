import { randomBytes, createHmac } from 'crypto';
import bcrypt from 'bcryptjs';
import * as bip39 from 'bip39';
import { OwnerTokenClaim, RecoveryPhrase, TokenValidationResult } from '@/types';

// Secure token generation
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

// Generate UUID v4
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Owner Token Management
export class OwnerTokenManager {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.OWNER_TOKEN_SECRET || 'fallback-secret';
  }

  // Generate new Owner Token
  generateOwnerToken(uid: string, deviceId?: string): string {
    const token = generateSecureToken();
    return token;
  }

  // Hash token for storage
  async hashToken(token: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(token, saltRounds);
  }

  // Verify token against hash
  async verifyToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }

  // Create token claim for JWT-style validation
  createTokenClaim(uid: string, deviceId: string, expiryHours: number = 24 * 30): OwnerTokenClaim {
    const now = Date.now();
    return {
      uid,
      deviceId,
      issued: now,
      expires: now + (expiryHours * 60 * 60 * 1000)
    };
  }

  // Validate token claim
  validateTokenClaim(claim: OwnerTokenClaim): TokenValidationResult {
    const now = Date.now();
    
    if (claim.expires < now) {
      return { valid: false, error: 'Token expired' };
    }

    if (!claim.uid || !claim.deviceId) {
      return { valid: false, error: 'Invalid token format' };
    }

    return { 
      valid: true, 
      uid: claim.uid, 
      deviceId: claim.deviceId 
    };
  }
}

// Recovery Key Management
export class RecoveryKeyManager {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.RECOVERY_KEY_SECRET || 'fallback-recovery-secret';
  }

  // Generate recovery phrase using BIP39
  generateRecoveryPhrase(): RecoveryPhrase {
    // Generate 128 bits of entropy for 12-word mnemonic
    const entropy = randomBytes(16);
    const mnemonic = bip39.entropyToMnemonic(entropy);
    const words = mnemonic.split(' ');
    
    // Create checksum for additional validation
    const checksum = createHmac('sha256', this.secret)
      .update(mnemonic)
      .digest('hex')
      .substring(0, 8);

    return {
      words,
      checksum
    };
  }

  // Validate recovery phrase
  validateRecoveryPhrase(phrase: RecoveryPhrase): boolean {
    const mnemonic = phrase.words.join(' ');
    
    // Validate BIP39 mnemonic
    if (!bip39.validateMnemonic(mnemonic)) {
      return false;
    }

    // Validate checksum
    const expectedChecksum = createHmac('sha256', this.secret)
      .update(mnemonic)
      .digest('hex')
      .substring(0, 8);

    return expectedChecksum === phrase.checksum;
  }

  // Hash recovery phrase for storage
  async hashRecoveryPhrase(phrase: RecoveryPhrase): Promise<string> {
    const mnemonic = phrase.words.join(' ');
    const saltRounds = 12;
    return bcrypt.hash(mnemonic + phrase.checksum, saltRounds);
  }

  // Verify recovery phrase against hash
  async verifyRecoveryPhrase(phrase: RecoveryPhrase, hash: string): Promise<boolean> {
    const mnemonic = phrase.words.join(' ');
    return bcrypt.compare(mnemonic + phrase.checksum, hash);
  }
}

// ShareId Management
export class ShareIdManager {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.SHARELINK_SECRET || 'fallback-sharelink-secret';
  }

  // Generate opaque ShareId
  generateShareId(): string {
    // Generate 20 bytes (160 bits) for strong security
    return generateSecureToken(20);
  }

  // Generate stable PublicId
  generatePublicId(): string {
    return generateUUID();
  }

  // Create short share URL
  createShareUrl(shareId: string, baseUrl?: string): string {
    const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://hushh.ai';
    return `${base}/p/${shareId}`;
  }

  // Validate ShareId format
  validateShareId(shareId: string): boolean {
    // Should be 40 hex characters (20 bytes)
    return /^[a-f0-9]{40}$/i.test(shareId);
  }
}

// Age calculation helper
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Phone number masking
export function maskPhoneNumber(phone: string): string {
  // Assuming E.164 format: +91XXXXXXXXXX
  if (phone.length < 10) return phone;
  
  if (phone.startsWith('+91')) {
    // Indian format: +91-••••-•••XX
    const lastTwo = phone.slice(-2);
    return `+91-••••-•••${lastTwo}`;
  }
  
  // Generic format: +XX-••••-•••XX
  const countryCode = phone.substring(0, 3);
  const lastTwo = phone.slice(-2);
  return `${countryCode}-••••-•••${lastTwo}`;
}

// Rate limiting helpers
export class RateLimiter {
  private readonly windows = new Map<string, { count: number; resetTime: number }>();

  // Check if action is rate limited
  isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const window = this.windows.get(key);

    if (!window || now > window.resetTime) {
      // New window or expired
      this.windows.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (window.count >= maxRequests) {
      return true;
    }

    window.count++;
    return false;
  }

  // Clear old windows periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, window] of this.windows.entries()) {
      if (now > window.resetTime) {
        this.windows.delete(key);
      }
    }
  }
}

// Singleton instances
export const ownerTokenManager = new OwnerTokenManager();
export const recoveryKeyManager = new RecoveryKeyManager();
export const shareIdManager = new ShareIdManager();
export const rateLimiter = new RateLimiter();

// Device fingerprinting
export function generateDeviceId(req?: Request): string {
  // Simple device fingerprinting based on headers
  if (typeof window !== 'undefined') {
    // Client-side: use stable browser fingerprint
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ].join('|');
    
    return createHmac('sha256', 'device-secret')
      .update(fingerprint)
      .digest('hex')
      .substring(0, 16);
  }
  
  // Server-side: generate random device ID
  return generateSecureToken(16);
}
