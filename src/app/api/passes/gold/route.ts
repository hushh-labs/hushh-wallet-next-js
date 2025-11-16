import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { buildGoldPassPayload, type User } from '@/lib/goldpass';

/**
 * GET /api/passes/gold?uid=...
 * 
 * Generate Apple Wallet Gold Pass (.pkpass)
 * Returns binary .pkpass file for download
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');
    
    if (!uid) {
      return NextResponse.json({
        success: false,
        error: 'uid parameter required'
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
    
    // Build gold pass payload
    const passPayload = buildGoldPassPayload(userData);
    
    try {
      // Call our universal pass API to generate the .pkpass
      const passResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://hushh-wallet.vercel.app'}/api/passes/universal/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passPayload)
      });
      
      if (!passResponse.ok) {
        console.error('Pass generation failed:', await passResponse.text());
        return NextResponse.json({
          success: false,
          error: 'Failed to generate pass'
        }, { status: 500 });
      }
      
      // Get the .pkpass file buffer
      const passBuffer = await passResponse.arrayBuffer();
      const passSerial = passResponse.headers.get('X-Pass-Serial');
      
      // Update user record with pass metadata
      if (passSerial) {
        await updateDoc(userRef, {
          'pass.serial': passSerial,
          'pass.lastGeneratedAt': serverTimestamp()
        });
      }
      
      console.log('Gold pass generated for:', uid, 'Serial:', passSerial);
      
      // Return .pkpass file with correct headers for Apple Wallet
      return new NextResponse(passBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': `attachment; filename="HushhGold-${uid}.pkpass"`,
          'X-Pass-Serial': passSerial || '',
          'X-Pass-Type': 'gold',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
    } catch (passError) {
      console.error('Pass generation error:', passError);
      return NextResponse.json({
        success: false,
        error: 'Pass generation service unavailable'
      }, { status: 503 });
    }
    
  } catch (error) {
    console.error('Gold pass endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * POST /api/passes/gold
 * 
 * Alternative interface for pass generation (same as GET)
 * Body: { uid }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid } = body;
    
    if (!uid) {
      return NextResponse.json({
        success: false,
        error: 'uid is required'
      }, { status: 400 });
    }
    
    // Redirect to GET with uid parameter
    const url = new URL(request.url);
    url.searchParams.set('uid', uid);
    
    return GET(new NextRequest(url));
    
  } catch (error) {
    console.error('Gold pass POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Invalid request body'
    }, { status: 400 });
  }
}

/**
 * OPTIONS /api/passes/gold
 * 
 * API documentation and status
 */
export async function OPTIONS() {
  return NextResponse.json({
    endpoint: '/api/passes/gold',
    methods: ['GET', 'POST'],
    description: 'Generate Hushh Gold Apple Wallet Pass',
    
    // GET method
    get: {
      url: '/api/passes/gold?uid={uid}',
      description: 'Generate .pkpass file for specified user',
      parameters: {
        uid: 'string (required) - User ID from claim endpoint'
      },
      response: {
        success: 'Binary .pkpass file with Apple Wallet headers',
        error: 'JSON error response'
      }
    },
    
    // POST method  
    post: {
      url: '/api/passes/gold',
      description: 'Alternative interface for pass generation',
      body: {
        uid: 'string (required) - User ID from claim endpoint'
      },
      response: {
        success: 'Binary .pkpass file with Apple Wallet headers',
        error: 'JSON error response'
      }
    },
    
    features: [
      'Gold matte Apple Wallet design',
      'Right-aligned "HUSHH" branding',
      'QR code linking to public profile',
      'Profile completion link on pass back',
      'Unique member ID display',
      'Pass serial tracking',
      'iOS Safari auto-open integration'
    ],
    
    usage: {
      curl: 'curl "https://hushh-wallet.vercel.app/api/passes/gold?uid=hu_abc123def456" -o gold-pass.pkpass',
      javascript: `
const response = await fetch('/api/passes/gold?uid=hu_abc123def456');
const passBlob = await response.blob();
// Create download link or serve to user
`
    }
  });
}
