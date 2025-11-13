import { createClient } from '@/utils/supabase/server'
import { getOrCreateAnonUser } from '@/utils/auth/anonymous'
import { 
  FormKey, 
  FormDataMap, 
  FormVisibilityMap,
  ProfileData,
  ProfileVisibility
} from '@/types/forms'

// Map form keys to table names
const FORM_TABLE_MAP: Record<FormKey, string> = {
  identity: 'identity_profiles',
  networth: 'networth_profiles', 
  bodyfit: 'bodyfit_profiles',
  food: 'food_preferences',
  lifestyle: 'lifestyle_profiles'
}

/**
 * Get user_id from hushh_uid cookie (from Step 1)
 */
export async function getUserIdFromCookie(hushhUid: string): Promise<string> {
  const anonUser = await getOrCreateAnonUser(hushhUid)
  return anonUser.userId
}

/**
 * Get form data for a specific user and form
 * Returns data JSON, visibility JSON, and updated_at timestamp
 */
export async function getFormData<T extends FormKey>(
  formKey: T, 
  userId: string
): Promise<{
  data: FormDataMap[T]
  visibility: FormVisibilityMap[T]
  updated_at: string
} | null> {
  const supabase = await createClient()
  const tableName = FORM_TABLE_MAP[formKey]
  
  const { data: profile, error } = await supabase
    .from(tableName)
    .select('data, visibility, updated_at')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return null
    }
    throw new Error(`Failed to get ${formKey} data: ${error.message}`)
  }

  return {
    data: profile.data as FormDataMap[T],
    visibility: profile.visibility as FormVisibilityMap[T],
    updated_at: profile.updated_at
  }
}

/**
 * Insert or update form data for a specific user and form
 * Uses upsert behavior: updates if row exists, inserts if not
 */
export async function upsertFormData<T extends FormKey>(
  formKey: T,
  userId: string,
  dataPayload: FormDataMap[T],
  visibilityPayload: FormVisibilityMap[T]
): Promise<{
  data: FormDataMap[T]
  visibility: FormVisibilityMap[T]
  updated_at: string
}> {
  const supabase = await createClient()
  const tableName = FORM_TABLE_MAP[formKey]
  
  // Use upsert: insert if not exists, update if exists
  const { data: profile, error } = await supabase
    .from(tableName)
    .upsert({
      user_id: userId,
      data: dataPayload,
      visibility: visibilityPayload,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id', // Conflict resolution on unique user_id
      ignoreDuplicates: false // Always update on conflict
    })
    .select('data, visibility, updated_at')
    .single()

  if (error) {
    throw new Error(`Failed to upsert ${formKey} data: ${error.message}`)
  }

  return {
    data: profile.data as FormDataMap[T],
    visibility: profile.visibility as FormVisibilityMap[T], 
    updated_at: profile.updated_at
  }
}

/**
 * Check if user has any data for a specific form
 * Useful for dashboard status calculations
 */
export async function hasFormData(formKey: FormKey, userId: string): Promise<boolean> {
  const formData = await getFormData(formKey, userId)
  
  if (!formData) return false
  
  // Check if data object has any meaningful content
  const dataKeys = Object.keys(formData.data)
  return dataKeys.length > 0 && dataKeys.some(key => {
    const value = (formData.data as any)[key]
    return value !== null && value !== undefined && value !== ''
  })
}

/**
 * Get completion status for all forms for a user
 * Returns object with form completion status
 */
export async function getFormCompletionStatus(userId: string): Promise<{
  [K in FormKey]: {
    hasData: boolean
    lastUpdated: string | null
  }
}> {
  const forms: FormKey[] = ['identity', 'networth', 'bodyfit', 'food', 'lifestyle']
  
  const status = {} as {
    [K in FormKey]: {
      hasData: boolean
      lastUpdated: string | null
    }
  }
  
  for (const formKey of forms) {
    try {
      const formData = await getFormData(formKey, userId)
      status[formKey] = {
        hasData: formData ? await hasFormData(formKey, userId) : false,
        lastUpdated: formData?.updated_at || null
      }
    } catch (error) {
      // If error occurs, mark as no data
      status[formKey] = {
        hasData: false,
        lastUpdated: null
      }
    }
  }
  
  return status
}

/**
 * Generic helper to get all profile data for a user
 * Useful for legacy card generation and QR code content
 */
export async function getAllUserProfiles(userId: string): Promise<{
  identity: FormDataMap['identity'] | null
  networth: FormDataMap['networth'] | null
  bodyfit: FormDataMap['bodyfit'] | null
  food: FormDataMap['food'] | null
  lifestyle: FormDataMap['lifestyle'] | null
}> {
  const forms: FormKey[] = ['identity', 'networth', 'bodyfit', 'food', 'lifestyle']
  
  const profiles = {} as any
  
  for (const formKey of forms) {
    try {
      const formData = await getFormData(formKey, userId)
      profiles[formKey] = formData?.data || null
    } catch (error) {
      profiles[formKey] = null
    }
  }
  
  return profiles
}

/**
 * Development helper: Log form data structure for debugging
 */
export async function debugFormData(formKey: FormKey, userId: string): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return
  
  try {
    const formData = await getFormData(formKey, userId)
    console.log(`🔍 [DEBUG] ${formKey.toUpperCase()} Form Data for user ${userId}:`, {
      hasData: !!formData,
      data: formData?.data || null,
      visibility: formData?.visibility || null,
      lastUpdated: formData?.updated_at || null
    })
  } catch (error) {
    console.error(`🚨 [DEBUG] Error fetching ${formKey} data:`, error)
  }
}
