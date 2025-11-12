import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { after } from 'next/server';
import { ownerTokenManager, shareIdManager, recoveryKeyManager, generateUUID } from '@/lib/tokenization';
import { getUser, createUser, updateUser, createPublicProfile } from '@/lib/firestore';
import { HushhCardPayload } from '@/types';
import { generateHushhIdPass } from '@/lib/hushhIdPassGenerator';
import { z } from 'zod';

// Route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Validate request body
const UpdateBody = z.object({
  section: z.enum(['personal', 'food']),
  data: z.record(z.string(), z.any())
});

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    let body;
    try {
      body = UpdateBody.parse(await request.json());
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body. Section and data are required.' },
        { status: 400 }
      );
    }

    const { section, data } = body;

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
      // Existing user - verify token stored in user record
      uid = 'temp'; // We'll get the real uid after looking up the user
      // For now, we'll use a simpler approach - get user by checking all users
      // In production, we'd store uid in the token claim
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
    let hasPass = false;

    // If complete but no pass yet, schedule background pass generation
    if (isComplete) {
      // Check if pass already exists (you may want to store this in the user record)
      // For now, we'll assume no pass exists and generate it in background
      
      const jobId = crypto.randomUUID();
      console.log(`Scheduling pass generation job ${jobId} for user ${uid}`);
      
      // Background job - runs after response is sent
      after(async () => {
        try {
          console.log(`Starting pass generation job ${jobId} for user ${uid}`);
          const passBuffer = await generateHushhIdPass(existingUser);
          
          // Store pass generation completion (you might want to add this to your data model)
          await updateUser(uid, {
            ...existingUser,
            passGeneration: {
              status: 'completed',
              completedAt: new Date(),
              jobId
            }
          });
          
          console.log(`Pass generation completed for user ${uid}, job ${jobId}`);
        } catch (error) {
          console.error(`Pass generation failed for user ${uid}, job ${jobId}:`, error);
          
          // Store failure status
          await updateUser(uid, {
            ...existingUser,
            passGeneration: {
              status: 'failed',
              failedAt: new Date(),
              error: error instanceof Error ? error.message : 'Unknown error',
              jobId
            }
          });
        }
      });
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
        hasPass,
        passGenerating: isComplete && !hasPass, // Indicates background job is running
        ...(isFirstTime && { 
          recoveryPhrase: recoveryKeyManager.generateRecoveryPhrase() // Only show on first creation
        })
      }
    }, { 
      status: isComplete && !hasPass ? 202 : 200 // 202 Accepted when background work is happening
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

    // Set pass headers
    if (isComplete) {
      if (hasPass) {
        response.headers.set('X-Pass-Available', 'true');
        response.headers.set('X-Pass-Download-Url', `/api/cards/download/${uid}`);
      } else {
        response.headers.set('X-Pass-Generating', 'true');
        response.headers.set('X-Pass-Status-Url', `/api/cards/status/${uid}`);
      }
    }

    return response;

  } catch (error) {
    console.error('Card update error:', error);
    
    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error instanceof Error ? error.message : 'Unknown error')
      : 'Internal server error';
    
    return NextResponse.json(
      { error: errorMessage },
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
