import crypto from 'crypto';

// ============================================================================
// HUSHH GOLD PASS - CORE UTILITIES
// ============================================================================

// US State codes for validation
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
  'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// ============================================================================
// DETERMINISTIC UID GENERATION
// ============================================================================

/**
 * Generate deterministic UID from user inputs
 * Same inputs always produce same UID (idempotent)
 */
export function generateUID(name: string, email: string, phone: string): string {
  if (!process.env.UID_SECRET) {
    throw new Error('UID_SECRET environment variable required');
  }

  // Canonicalize inputs
  const canonicalEmail = email.toLowerCase().trim();
  const canonicalPhone = normalizeUSPhone(phone);
  const canonicalName = name.trim().replace(/\s+/g, ' ');
  
  // Create deterministic string
  const canonical = `${canonicalEmail}|${canonicalPhone}|${canonicalName}`;
  
  // Generate HMAC-SHA256
  const hash = crypto
    .createHmac('sha256', process.env.UID_SECRET)
    .update(canonical)
    .digest();
  
  // Convert to base32-like encoding (lowercase, no confusing chars)
  const base32chars = 'abcdefghijklmnopqrstuvwxyz234567';
  let result = '';
  
  for (let i = 0; i < 12; i++) {
    result += base32chars[hash[i] % base32chars.length];
  }
  
  return `hu_${result}`;
}

// ============================================================================
// PHONE NORMALIZATION (US-ONLY)
// ============================================================================

/**
 * Normalize US phone number to E.164 format
 * Input: Various formats (10 or 11 digits)
 * Output: +1XXXXXXXXXX
 */
export function normalizeUSPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle 10-digit numbers (add country code)
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // Handle 11-digit numbers starting with 1
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  throw new Error('Invalid US phone number. Must be 10 or 11 digits.');
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate email address (basic RFC check)
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Invalid email format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate US phone number
 */
export function validateUSPhone(phone: string): ValidationResult {
  const errors: string[] = [];
  
  if (!phone || phone.trim().length === 0) {
    errors.push('Phone number is required');
  } else {
    try {
      normalizeUSPhone(phone);
    } catch (error) {
      errors.push('Invalid US phone number format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate name
 */
export function validateName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (name.trim().length > 50) {
    errors.push('Name must be less than 50 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate US state code
 */
export function validateUSState(state: string): ValidationResult {
  const errors: string[] = [];
  
  if (!state || state.trim().length === 0) {
    errors.push('State is required');
  } else if (!US_STATES.includes(state.toUpperCase())) {
    errors.push('Invalid US state code');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate ZIP code (5 or 9 digits)
 */
export function validateZIP(zip: string): ValidationResult {
  const errors: string[] = [];
  
  if (!zip || zip.trim().length === 0) {
    errors.push('ZIP code is required');
  } else {
    const zipRegex = /^(\d{5})(-\d{4})?$/;
    if (!zipRegex.test(zip.trim())) {
      errors.push('Invalid ZIP code format (use NNNNN or NNNNN-NNNN)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate age (COPPA compliance)
 */
export function validateAge(age: number): ValidationResult {
  const errors: string[] = [];
  
  if (!age || isNaN(age)) {
    errors.push('Age is required');
  } else if (age < 13) {
    errors.push('Must be 13 or older'); // COPPA compliance
  } else if (age > 120) {
    errors.push('Invalid age');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate gender
 */
export function validateGender(gender: string): ValidationResult {
  const errors: string[] = [];
  
  if (!gender || gender.trim().length === 0) {
    errors.push('Gender is required');
  } else if (!['male', 'female'].includes(gender.toLowerCase())) {
    errors.push('Gender must be male or female');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate city
 */
export function validateCity(city: string): ValidationResult {
  const errors: string[] = [];
  
  if (!city || city.trim().length === 0) {
    errors.push('City is required');
  } else if (city.trim().length < 2) {
    errors.push('City name too short');
  } else if (city.trim().length > 50) {
    errors.push('City name too long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generate secure random token for profile completion
 */
export function generateProfileToken(): string {
  return crypto.randomBytes(16).toString('hex'); // 32 hex chars = 128 bits
}

// ============================================================================
// URL BUILDERS
// ============================================================================

export function buildPublicUrl(uid: string): string {
  return `https://hushh-wallet.vercel.app/u/${uid}`;
}

export function buildProfileUrl(uid: string, token: string): string {
  return `https://hushh-wallet.vercel.app/u/${uid}/complete?token=${token}`;
}

export function buildPassUrl(uid: string): string {
  return `https://hushh-wallet.vercel.app/api/passes/gold?uid=${uid}`;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ClaimRequest {
  name: string;
  email: string;
  phone: string;
}

export interface ClaimResponse {
  uid: string;
  addToWalletUrl: string;
  profileUrl: string;
}

export interface ProfileRequest {
  uid: string;
  token: string;
  city: string;
  state: string;
  zip: string;
  gender: 'male' | 'female';
  age: number;
  street1?: string;
}

export interface User {
  uid: string;
  identity: {
    name: string;
    email: string;
    phoneE164: string;
  };
  profile?: {
    street1?: string;
    city: string;
    state: string;
    zip: string;
    gender: 'male' | 'female';
    age: number;
  };
  links: {
    publicUrl: string;
    profileUrl: string;
  };
  tokens: {
    profileToken: string;
  };
  pass?: {
    serial?: string;
    lastGeneratedAt?: any; // Firestore timestamp
  };
  meta: {
    tier: 'gold';
    createdAt: any; // Firestore timestamp
    lastSeenAt: any; // Firestore timestamp
  };
}

// ============================================================================
// GOLD PASS PAYLOAD BUILDER
// ============================================================================

export function buildGoldPassPayload(user: User): any {
  return {
    passType: 'storeCard',
    description: 'Hushh Gold Membership',
    organizationName: 'Hushh Technologies',
    logoText: 'HUSHH',
    
    // Gold matte theme
    backgroundColor: 'rgb(117, 65, 10)',
    foregroundColor: 'rgb(255, 248, 235)', 
    labelColor: 'rgb(216, 178, 111)',
    
    // Pass fields
    primaryFields: [
      { key: 'tier', value: 'GOLD MEMBER' }
    ],
    secondaryFields: [
      { key: 'member_id', label: 'Member ID', value: user.uid }
    ],
    backFields: [
      {
        key: 'complete_profile',
        label: 'Complete Your Profile',
        value: `Tap to add your address and preferences:\n${user.links.profileUrl}`
      }
    ],
    
    // QR code to public profile
    barcode: {
      message: user.links.publicUrl,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'utf-8'
    },
    
    // Security settings
    sharingProhibited: true
  };
}
