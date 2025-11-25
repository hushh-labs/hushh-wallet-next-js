import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ownerTokenManager } from '@/lib/tokenization';
import { getUser } from '@/lib/firestore';
import { generateHushhIdPass } from '@/lib/hushhIdPassGenerator';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  try {
    const params = await context.params;
    const { uid } = params;

    // Check for Owner Token to verify access
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get('hushh_owner_token')?.value;
    const uidCookie = cookieStore.get('hushh_uid')?.value;

    if (!ownerToken || !uidCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify uid from cookie matches requested uid
    if (uidCookie !== uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get user data
    const user = await getUser(uid);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify token matches stored hash
    const tokenValid = await ownerTokenManager.verifyToken(ownerToken, user.owner.ownerTokenHash);
    if (!tokenValid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user has complete data
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

    if (!personalComplete || !foodComplete) {
      return NextResponse.json(
        { error: 'Incomplete user data - cannot generate pass' },
        { status: 400 }
      );
    }

    // Generate pass
    const passBuffer = await generateHushhIdPass(user);
    const filename = `hushh-id-${user.card.passSerial}.pkpass`;

    // Return pass file
    return new NextResponse(new Uint8Array(passBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': passBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Pass download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pass' },
      { status: 500 }
    );
  }
}
