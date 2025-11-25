import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ownerTokenManager, shareIdManager, recoveryKeyManager, generateUUID } from '@/lib/tokenization';
import { getUser, createUser, updateUser, createPublicProfile, getUserByToken } from '@/lib/firestore';
import { HushhCardPayload } from '@/types';
import { generateHushhIdPass } from '@/lib/hushhIdPassGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { error: 'Section and data are required' },
        { status: 400 }
      );
    }

    // Check for existing Owner Token
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get('hushh_owner_token')?.value;

    let uid: string;
    let isFirstTime = false;
    let newOwnerToken: string | null = null;

    if (!ownerToken) {
      // First time - create new user
      isFirstTime = true;
      uid = generateUUID();
      const deviceId = request.headers.get('x-device-id') || 'default';
      newOwnerToken = ownerTokenManager.generateOwnerToken(uid, deviceId);
    } else {
      // Existing user - verify token
      const tokenHash = await ownerTokenManager.hashToken(ownerToken);
      const existingUserResult = await getUserByToken(tokenHash);

      if (existingUserResult) {
        uid = existingUserResult.uid;
      } else {
        // Token invalid or user not found - treat as new user
        isFirstTime = true;
        uid = generateUUID();
        const deviceId = request.headers.get('x-device-id') || 'default';
        newOwnerToken = ownerTokenManager.generateOwnerToken(uid, deviceId);
      }
    }

    // Get existing user data or create new
    let existingUser = isFirstTime ? null : await getUser(uid);

    if (!existingUser && isFirstTime) {
      // Create initial user record
      const recoveryPhrase = recoveryKeyManager.generateRecoveryPhrase();
      const recoveryKeyHash = await recoveryKeyManager.hashRecoveryPhrase(recoveryPhrase);
      const ownerTokenHash = await ownerTokenManager.hashToken(newOwnerToken!);

      existingUser = {
        profile: { preferredName: '', legalName: '', dob: '', phone: '' },
        food: {
          foodType: 'omnivore' as const,
          spiceLevel: 'medium' as const,
          topCuisines: [],
          dishStyles: [],
          exclusions: []
        },
        shareSettings: { visibility: 'public_minimal', redactionPolicy: {} },
        card: {
          publicId: `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          activeShareId: shareIdManager.generateShareId(),
          passSerial: `H-ID-${Date.now()}`
        },
        owner: { ownerTokenHash, recoveryKeyHash, createdAt: new Date(), lastSeenDevice: 'web' }
      };

      await createUser(uid, existingUser);
    }

    // Ensure we have a user record at this point
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Failed to create or retrieve user record' },
        { status: 500 }
      );
    }

    // Update the specific section
    if (section === 'personal') {
      // Update personal data
      existingUser.profile = {
        ...existingUser.profile,
        preferredName: data.preferredName || existingUser.profile.preferredName,
        legalName: data.legalName || existingUser.profile.legalName,
        dob: data.dob || existingUser.profile.dob,
        phone: data.phone || existingUser.profile.phone,
        gender: data.gender || existingUser.profile.gender
      };
    } else if (section === 'food') {
      // Update food data
      existingUser.food = {
        ...existingUser.food,
        foodType: data.foodType || existingUser.food.foodType,
        spiceLevel: data.spiceLevel || existingUser.food.spiceLevel,
        topCuisines: data.cuisines || existingUser.food.topCuisines,
        dishStyles: data.dishes || existingUser.food.dishStyles,
        exclusions: data.exclusions || existingUser.food.exclusions
      };
    }

    // Save updated user data
    await updateUser(uid, existingUser);

    // Create public profile snapshot
    await createPublicProfile(existingUser.card.publicId, existingUser);

    // Check if both sections are complete for pass generation
    const isComplete = isDataComplete(existingUser);
    let passBuffer = null;

    if (isComplete) {
      try {
        // Generate wallet pass
        passBuffer = await generateHushhIdPass(existingUser);
      } catch (error) {
        console.warn('Pass generation failed:', error);
        // Continue without pass generation
      }
    }

    const response = NextResponse.json({
      success: true,
      data: {
        uid,
        section,
        isComplete,
        publicId: existingUser.card.publicId,
        shareId: existingUser.card.activeShareId,
        shareUrl: shareIdManager.createShareUrl(existingUser.card.activeShareId),
        passSerial: existingUser.card.passSerial,
        hasPass: !!passBuffer,
        ...(isFirstTime && {
          recoveryPhrase: recoveryKeyManager.generateRecoveryPhrase() // Only show on first creation
        })
      }
    });

    // Set HttpOnly cookie for new users
    if (isFirstTime && newOwnerToken) {
      response.cookies.set('hushh_owner_token', newOwnerToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    // Set pass download headers if available
    if (passBuffer && isComplete) {
      response.headers.set('X-Pass-Available', 'true');
      response.headers.set('X-Pass-Download-Url', `/api/cards/download/${uid}`);
    }

    return response;

  } catch (error) {
    console.error('Card update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check existing user status
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get('hushh_owner_token')?.value;

    if (!ownerToken) {
      return NextResponse.json({
        exists: false,
        sections: { personal: false, food: false }
      });
    }

    // For now, we'll implement a simpler check
    // In production, we'd have a proper token-to-uid mapping
    // Let's just check if we have any user data
    return NextResponse.json({
      exists: true,
      sections: { personal: false, food: false },
      isComplete: false,
      message: 'Status check available after first data entry'
    });

    /* TODO: Implement proper token verification once we have user lookup by token
    const verification = await ownerTokenManager.verifyToken(ownerToken, storedHash);
    if (!verification) {
      return NextResponse.json({
        exists: false,
        sections: { personal: false, food: false }
      });
    }

    const user = await getUser(uid);
    if (!user) {
      return NextResponse.json({
        exists: false,
        sections: { personal: false, food: false }
      });
    }

    const personalComplete = !!(
      user.profile.preferredName && 
      user.profile.legalName && 
      user.profile.dob && 
      user.profile.phone
    );

    const foodComplete = !!(
      user.food.foodType && 
      user.food.spiceLevel
    );

    return NextResponse.json({
      exists: true,
      sections: { personal: personalComplete, food: foodComplete },
      isComplete: personalComplete && foodComplete,
      publicId: user.card.publicId,
      shareId: user.card.activeShareId,
      shareUrl: shareIdManager.createShareUrl(user.card.activeShareId)
    });
    */

  } catch (error) {
    console.error('Card status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function isDataComplete(user: any): boolean {
  const personalComplete = !!(
    user.profile.preferredName &&
    user.profile.legalName &&
    user.profile.dob &&
    user.profile.phone
  );

  const foodComplete = !!(
    user.food.foodType &&
    user.food.spiceLevel
  );

  return personalComplete && foodComplete;
}
