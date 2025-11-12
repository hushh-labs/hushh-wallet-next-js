import { NextRequest, NextResponse } from 'next/server';
import { getShareLink, getPublicProfile, logScanEvent } from '@/lib/firestore';
import { shareIdManager } from '@/lib/tokenization';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shareId: string }> }
) {
  try {
    const params = await context.params;
    const { shareId } = params;

    // Validate ShareId format
    if (!shareIdManager.validateShareId(shareId)) {
      return NextResponse.json(
        { error: 'Invalid share link' },
        { status: 400 }
      );
    }

    // Get share link record
    const shareLink = await getShareLink(shareId);
    
    if (!shareLink) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      );
    }

    // Check if share link is active
    if (shareLink.status !== 'active') {
      return NextResponse.json(
        { error: 'Share link has been revoked' },
        { status: 410 } // Gone
      );
    }

    // Check TTL if set
    if (shareLink.ttl && new Date() > shareLink.ttl) {
      return NextResponse.json(
        { error: 'Share link has expired' },
        { status: 410 }
      );
    }

    // Get public profile
    const publicProfile = await getPublicProfile(shareLink.publicId);
    
    if (!publicProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if profile is private/redacted
    if (publicProfile.redacted) {
      return NextResponse.json(
        { 
          error: 'Profile is private',
          message: 'This user has chosen not to share their details publicly.'
        },
        { status: 403 }
      );
    }

    // Log scan event (async, don't wait)
    const userAgent = request.headers.get('user-agent');
    logScanEvent(shareId, shareLink.publicId, userAgent || undefined).catch(console.error);

    // Return public profile data
    return NextResponse.json({
      success: true,
      data: {
        profile: publicProfile,
        shareId,
        lastUpdated: publicProfile.lastUpdated.toISOString()
      }
    });

  } catch (error) {
    console.error('QR resolution error:', error);
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 }
    );
  }
}
