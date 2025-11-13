import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

export interface AnonUser {
  userId: string
  hushhUid: string
}

export async function getHushhUid(): Promise<string> {
  const cookieStore = await cookies()
  let hushhUid = cookieStore.get('hushh_uid')?.value

  if (!hushhUid) {
    // Generate new UUID v4 for anonymous user
    hushhUid = uuidv4()
    
    // Set cookie with 12 months expiry
    cookieStore.set('hushh_uid', hushhUid, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 12 months in seconds
      httpOnly: false, // Allow client-side access if needed
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  }

  return hushhUid as string
}

export async function getOrCreateAnonUser(hushhUid?: string): Promise<AnonUser> {
  const supabase = await createClient()
  
  // Get hushh_uid from parameter or cookie
  const currentHushhUid = hushhUid || (await getHushhUid())
  
  // Try to find existing user
  let { data: existingUser, error: fetchError } = await supabase
    .from('users_anon')
    .select('id, hushh_uid')
    .eq('hushh_uid', currentHushhUid)
    .single()

  if (existingUser && !fetchError) {
    // User exists, update last_seen_at
    await supabase
      .from('users_anon')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', existingUser.id)

    return {
      userId: existingUser.id,
      hushhUid: existingUser.hushh_uid
    }
  }

  // User doesn't exist, create new one
  const { data: newUser, error: createError } = await supabase
    .from('users_anon')
    .insert({
      hushh_uid: currentHushhUid,
      created_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString()
    })
    .select('id, hushh_uid')
    .single()

  if (createError) {
    throw new Error(`Failed to create anonymous user: ${createError.message}`)
  }

  return {
    userId: newUser.id,
    hushhUid: newUser.hushh_uid
  }
}

export async function getCurrentUserId(): Promise<string> {
  const anonUser = await getOrCreateAnonUser()
  return anonUser.userId
}

export async function getCurrentUser(): Promise<AnonUser> {
  return await getOrCreateAnonUser()
}
