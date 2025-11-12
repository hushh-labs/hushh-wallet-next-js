import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ownerTokenManager } from '@/lib/tokenization';
import { getUser } from '@/lib/firestore';
import { generateHushhIdPass } from '@/lib/hushhIdPassGenerator';

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;

    // Check for Owner Token to verify access
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get('hushh_owner_token')?.value;

    if (!ownerToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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
