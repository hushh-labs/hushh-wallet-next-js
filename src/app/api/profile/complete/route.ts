import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  validateCity,
  validateUSState,
  validateZIP,
  validateGender,
  validateAge,
  type ProfileRequest,
  type User
} from '@/lib/goldpass';

/**
 * POST /api/profile/complete
 * 
 * Complete user profile with US address and demographics
 * Input: { uid, token, city, state, zip, gender, age, street1? }
 * Output: { success: true } or error response
 */
export async function POST(request: NextRequest) {
  try {
    const body: ProfileRequest = await request.json();
    const { uid, token, city, state, zip, gender, age, street1 } = body;
    
    // Validate required fields
    if (!uid || !token) {
      return NextResponse.json({
        success: false,
        error: 'uid and token are required'
      }, { status: 400 });
    }
    
    // Validate profile data
    const cityValidation = validateCity(city);
    const stateValidation = validateUSState(state);
    const zipValidation = validateZIP(zip);
    const genderValidation = validateGender(gender);
    const ageValidation = validateAge(age);
    
    const errors: string[] = [
      ...cityValidation.errors,
      ...stateValidation.errors,
      ...zipValidation.errors,
      ...genderValidation.errors,
      ...ageValidation.errors
    ];
    
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors
      }, { status: 400 });
    }
    
    // Fetch user data from Firestore
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    const userData = userDoc.data() as User;
    
    // Verify bearer token
    if (userData.tokens.profileToken !== token) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token'
      }, { status: 403 });
    }
    
    try {
      // Build profile object
      const profileData = {
        city: city.trim(),
        state: state.toUpperCase(),
        zip: zip.trim(),
        gender: gender.toLowerCase() as 'male' | 'female',
        age: parseInt(age.toString(), 10),
        ...(street1 && street1.trim() && { street1: street1.trim() })
      };
      
      // Update user profile in Firestore
      await updateDoc(userRef, {
        profile: profileData,
        'meta.lastSeenAt': serverTimestamp()
      });
      
      console.log('Profile completed for user:', uid);
      
      return NextResponse.json({
        success: true,
        message: 'Profile completed successfully'
      });
      
    } catch (firestoreError) {
      console.error('Profile update failed:', firestoreError);
      return NextResponse.json({
        success: false,
        error: 'Failed to save profile'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Profile complete endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * GET /api/profile/complete
 * 
 * API documentation and field requirements
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/profile/complete',
    method: 'POST',
    description: 'Complete user profile with US address and demographics',
    
    // Authentication
    authentication: {
      type: 'Bearer Token',
      description: 'Use profileToken from claim response',
      example: 'Include token in request body'
    },
    
    // Input schema
    input: {
      uid: 'string (required) - User ID',
      token: 'string (required) - Profile completion token',
      city: 'string (required, 2-50 chars) - US city name',
      state: 'string (required) - 2-letter US state code (e.g., CA, NY)',
      zip: 'string (required) - ZIP code (NNNNN or NNNNN-NNNN)',
      gender: 'string (required) - "male" or "female"',
      age: 'number (required, 13-120) - Age in years (COPPA compliant)',
      street1: 'string (optional, max 100 chars) - Street address line 1'
    },
    
    // Output schema
    output: {
      success: 'boolean',
      message: 'string (success message)',
      errors: 'string[] (validation errors if any)'
    },
    
    // Validation rules
    validation: {
      city: 'Must be 2-50 characters, no special requirements',
      state: 'Must be valid US state code (AL, AK, AZ, ... WY, DC)',
      zip: 'Must be 5 digits (12345) or ZIP+4 (12345-6789)',
      gender: 'Must be exactly "male" or "female" (per requirements)',
      age: 'Must be 13+ years (COPPA compliance), max 120',
      street1: 'Optional, max 100 characters if provided'
    },
    
    // Security features
    security: [
      'Bearer token authentication (32-hex profileToken)',
      'Token tied to specific user UID',
      'One-time profile completion per token',
      'No sensitive PII exposed in public endpoints',
      'Age minimum enforced (13+ COPPA compliance)'
    ],
    
    // Example usage
    example: {
      url: 'POST https://hushh-wallet.vercel.app/api/profile/complete',
      body: {
        uid: 'hu_abc123def456',
        token: 'a1b2c3d4e5f6789...',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        gender: 'female',
        age: 28,
        street1: '123 Market St' // optional
      }
    },
    
    // US State codes reference
    validStates: [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
      'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
      'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
      'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
      'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ]
  });
}

/**
 * OPTIONS /api/profile/complete
 * 
 * CORS preflight and API info
 */
export async function OPTIONS() {
  return NextResponse.json({
    methods: ['POST', 'GET'],
    description: 'Profile completion endpoint for Hushh Gold Pass',
    cors: {
      origin: '*',
      methods: 'POST, GET, OPTIONS',
      headers: 'Content-Type'
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
