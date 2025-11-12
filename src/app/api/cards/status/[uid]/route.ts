import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    
    if (!uid) {
      return NextResponse.json(
        { error: 'UID is required' },
        { status: 400 }
      );
    }

    const user = await getUser(uid);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isComplete = isDataComplete(user);
    const passGeneration = user.passGeneration || { status: 'pending' };
    
    return NextResponse.json({
      uid,
      isComplete,
      passGeneration,
      hasPass: passGeneration.status === 'completed',
      shareUrl: `https://hushh.ai/p/${user.card.activeShareId}`,
      downloadUrl: passGeneration.status === 'completed' ? `/api/cards/download/${uid}` : null
    });

  } catch (error) {
    console.error('Card status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
