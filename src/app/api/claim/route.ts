import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  generateUID,
  normalizeUSPhone,
  generateProfileToken,
  buildPublicUrl,
  buildProfileUrl,
  buildPassUrl,
  validateEmail,
  validateUSPhone,
  validateName,
  type ClaimRequest,
  type ClaimResponse,
  type User
} from '@/lib/goldpass';

/**
 * POST /api/claim
 * 
 * Claim a Hushh Gold Pass
 * Input: { name, email, phone }
 * Output: { uid, addToWalletUrl, profileUrl }
 */
export async function POST(request: NextRequest) {
  try {
    const body: ClaimRequest = await request.json();
    const { name, email, phone } = body;
    
    // Validate inputs
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const phoneValidation = validateUSPhone(phone);
    
    const errors: string[] = [
      ...nameValidation.errors,
      ...emailValidation.errors,
      ...phoneValidation.errors
    ];
    
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors
      }, { status: 400 });
    }
    
    // Generate deterministic UID
    let uid: string;
    try {
      uid = generateUID(name, email, phone);
    } catch (error) {
      console.error('UID generation failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to generate user ID'
      }, { status: 500 });
    }
    
    // Normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = normalizeUSPhone(phone);
    const normalizedName = name.trim().replace(/\s+/g, ' ');
    
    const userRef = doc(db, 'users', uid);
    const now = new Date();
    
    try {
      // Check if user exists
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // User exists - update lastSeenAt and return existing data
        const userData = userDoc.data() as User;
        
        await updateDoc(userRef, {
          'meta.lastSeenAt': serverTimestamp()
        });
        
        const response: ClaimResponse = {
          uid: userData.uid,
          addToWalletUrl: buildPassUrl(uid),
          profileUrl: userData.links.profileUrl
        };
        
        console.log('Existing user claimed pass:', uid);
        
        return NextResponse.json({
          success: true,
          ...response
        });
        
      } else {
        // New user - create full record
        const profileToken = generateProfileToken();
        
        const newUser: User = {
          uid,
          identity: {
            name: normalizedName,
            email: normalizedEmail,
            phoneE164: normalizedPhone
          },
          links: {
            publicUrl: buildPublicUrl(uid),
            profileUrl: buildProfileUrl(uid, profileToken)
          },
          tokens: {
            profileToken
          },
          meta: {
            tier: 'gold',
            createdAt: now,
            lastSeenAt: now
          }
        };
        
        await setDoc(userRef, {
          ...newUser,
          meta: {
            ...newUser.meta,
            createdAt: serverTimestamp(),
            lastSeenAt: serverTimestamp()
          }
        });
        
        const response: ClaimResponse = {
          uid,
          addToWalletUrl: buildPassUrl(uid),
          profileUrl: newUser.links.profileUrl
        };
        
        console.log('New user created and claimed pass:', uid);
        
        return NextResponse.json({
          success: true,
          ...response
        });
      }
      
    } catch (firestoreError) {
      console.error('Firestore operation failed:', firestoreError);
      return NextResponse.json({
        success: false,
        error: 'Database operation failed'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Claim endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * GET /api/claim
 * 
 * API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/claim',
    method: 'POST',
    description: 'Claim a Hushh Gold Pass',
    input: {
      name: 'string (required, 2-50 chars)',
      email: 'string (required, valid email)',
      phone: 'string (required, US phone number)'
    },
    output: {
      success: 'boolean',
      uid: 'string (deterministic user ID)',
      addToWalletUrl: 'string (Apple Wallet pass URL)',
      profileUrl: 'string (profile completion URL with token)'
    },
    features: [
      'Deterministic UID generation (same inputs = same UID)',
      'Idempotent operations (repeat claims return same data)',
      'US phone number normalization',
      'Comprehensive input validation',
      'COPPA compliant (no under-13 users)',
      'Privacy-focused (minimal PII exposure)'
    ]
  });
}
