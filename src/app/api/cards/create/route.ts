import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  ownerTokenManager, 
  recoveryKeyManager, 
  shareIdManager,
  generateDeviceId,
  generateUUID,
  rateLimiter 
} from '@/lib/tokenization';
import { 
  buildUserRecord,
  createUser,
  createPublicProfile,
  createShareLink,
  validateHushhCardPayload,
  validatePhoneNumber,
  validateDateOfBirth
} from '@/lib/firestore';
import { HushhCardPayload } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Rate limiting: 1 card creation per hour per IP
    if (rateLimiter.isRateLimited(`create:${clientIP}`, 1, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate payload structure
    if (!validateHushhCardPayload(body)) {
      return NextResponse.json(
        { error: 'Invalid card data. Please check all required fields.' },
        { status: 400 }
      );
    }

    const payload: HushhCardPayload = body;

    // Additional validations
    if (!validatePhoneNumber(payload.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Please use E.164 format (e.g., +91XXXXXXXXXX)' },
        { status: 400 }
      );
    }

    if (!validateDateOfBirth(payload.dob)) {
      return NextResponse.json(
        { error: 'Invalid date of birth. Must be at least 13 years old.' },
        { status: 400 }
      );
    }

    // Generate unique identifiers
    const uid = generateUUID();
    const deviceId = generateDeviceId();

    // Generate auth tokens
    const ownerToken = ownerTokenManager.generateOwnerToken(uid, deviceId);
    const recoveryPhrase = recoveryKeyManager.generateRecoveryPhrase();

    // Hash tokens for storage
    const ownerTokenHash = await ownerTokenManager.hashToken(ownerToken);
    const recoveryKeyHash = await recoveryKeyManager.hashRecoveryPhrase(recoveryPhrase);

    // Build user record
    const userRecord = buildUserRecord(payload, ownerTokenHash, recoveryKeyHash, deviceId);

    try {
      // Create Firebase records
      await createUser(uid, userRecord);
      await createPublicProfile(userRecord.card.publicId, userRecord);
      await createShareLink(userRecord.card.activeShareId, userRecord.card.publicId);

      // Set Owner Token as HttpOnly cookie
      const cookieStore = await cookies();
      cookieStore.set('hushh_owner_token', ownerToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });

      // Set UID cookie for client-side identification
      cookieStore.set('hushh_uid', uid, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });

      // Create share URL
      const shareUrl = shareIdManager.createShareUrl(userRecord.card.activeShareId);

      // Analytics: card_created
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'card_created', {
          event_category: 'card_creation',
          card_type: 'hushh_id'
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          uid,
          publicId: userRecord.card.publicId,
          shareId: userRecord.card.activeShareId,
          shareUrl,
          passSerial: userRecord.card.passSerial,
          recoveryPhrase: {
            words: recoveryPhrase.words,
            checksum: recoveryPhrase.checksum
          }
        },
        message: 'Hushh ID Card created successfully'
      });

    } catch (firebaseError) {
      console.error('Firebase operation failed:', firebaseError);
      return NextResponse.json(
        { error: 'Failed to create card. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Card creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check creation status
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get('hushh_owner_token')?.value;
    const uid = cookieStore.get('hushh_uid')?.value;

    if (!ownerToken || !uid) {
      return NextResponse.json(
        { hasCard: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        hasCard: true,
        uid 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { hasCard: false },
      { status: 200 }
    );
  }
}
