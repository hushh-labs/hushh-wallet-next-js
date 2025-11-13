import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Handle anonymous user identity via hushh_uid cookie
  let hushhUid = request.cookies.get('hushh_uid')?.value

  if (!hushhUid) {
    // Generate new UUID v4 for anonymous user
    hushhUid = uuidv4()
    
    // Set cookie with 12 months expiry
    response.cookies.set('hushh_uid', hushhUid, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 12 months in seconds
      httpOnly: false, // Allow client-side access if needed
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    // Log for development (only in dev mode)
    if (process.env.NODE_ENV === 'development') {
      console.log('🆔 New anonymous user created:', hushhUid)
    }
  } else {
    // Log existing user (only in dev mode)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Existing anonymous user:', hushhUid)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
