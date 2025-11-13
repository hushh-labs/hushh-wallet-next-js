import { createClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/utils/auth/anonymous'
import { 
  LegacyCard, 
  LegacyCardPayload,
  LegacyCreateData,
  LegacyCardData,
  LegacyDimension,
  LEGACY_DIMENSION_METADATA,
  LEGACY_DEFAULT_INCLUDES
} from '@/types/legacy'
import { FormKey } from '@/types/forms'
import { getFormCompletionStatus } from '@/utils/forms/operations'
import { 
  generateIdentitySummary,
  generateNetWorthSummary, 
  generateBodyFitSummary,
  generateFoodSummary,
  generateLifestyleSummary
} from '@/utils/dashboard/status-logic'
import { getFormData } from '@/utils/forms/operations'

/**
 * Get legacy card for a user
 * Returns null if no card exists
 */
export async function getLegacyCard(userId: string): Promise<LegacyCard | null> {
  try {
    const supabase = await createClient()
    
    const { data: card, error } = await supabase
      .from('legacy_cards')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null
      }
      throw new Error(`Failed to get legacy card: ${error.message}`)
    }

    return card as LegacyCard
  } catch (error) {
    console.error('Error getting legacy card:', error)
    return null
  }
}

/**
 * Create or update legacy card for a user
 * Uses upsert behavior: creates if not exists, updates if exists
 */
export async function upsertLegacyCard(
  userId: string, 
  payload: LegacyCardPayload
): Promise<LegacyCard> {
  const supabase = await createClient()
  
  try {
    // First try to get existing card
    const existingCard = await getLegacyCard(userId)
    
    if (existingCard) {
      // Update existing card
      const { data: updatedCard, error: updateError } = await supabase
        .from('legacy_cards')
        .update({
          ...payload,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select('*')
        .single()

      if (updateError) {
        throw new Error(`Failed to update legacy card: ${updateError.message}`)
      }

      return updatedCard as LegacyCard
    } else {
      // Create new card with generated public token
      const { data: newTokenData, error: tokenError } = await supabase
        .rpc('generate_unique_public_token')

      if (tokenError) {
        throw new Error(`Failed to generate public token: ${tokenError.message}`)
      }

      const { data: newCard, error: createError } = await supabase
        .from('legacy_cards')
        .insert({
          user_id: userId,
          public_token: newTokenData as string,
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (createError) {
        throw new Error(`Failed to create legacy card: ${createError.message}`)
      }

      return newCard as LegacyCard
    }
  } catch (error) {
    console.error('Error upserting legacy card:', error)
    throw error
  }
}

/**
 * Get data for /legacy/create page
 */
export async function getLegacyCreateData(): Promise<LegacyCreateData> {
  const user = await getCurrentUser()
  
  // Get form completion status
  const formStatus = await getFormCompletionStatus(user.userId)
  
  // Get existing legacy card
  const existingCard = await getLegacyCard(user.userId)
  
  // Build dimensions array
  const dimensionKeys: FormKey[] = ['identity', 'networth', 'bodyfit', 'food', 'lifestyle']
  const dimensions: LegacyDimension[] = dimensionKeys.map(key => {
    const metadata = LEGACY_DIMENSION_METADATA[key]
    const hasData = formStatus[key]?.hasData || false
    
    // Determine include flag
    let include: boolean
    if (existingCard) {
      // Use existing card settings
      include = existingCard[`include_${key}` as keyof LegacyCard] as boolean
    } else {
      // Use defaults, but only if hasData
      include = hasData && LEGACY_DEFAULT_INCLUDES[key]
    }
    
    return {
      key,
      title: metadata.title,
      subtext: metadata.subtext,
      route: metadata.route,
      hasData,
      include
    }
  })
  
  // Generate textual preview
  const textualPreview = await generateTextualPreview(user.userId, dimensions)
  
  return {
    user: {
      userId: user.userId,
      hushhUid: user.hushhUid
    },
    dimensions,
    existingCard,
    textualPreview
  }
}

/**
 * Get data for /legacy/card page
 */
export async function getLegacyCardData(): Promise<LegacyCardData | null> {
  const user = await getCurrentUser()
  
  // Get legacy card
  const card = await getLegacyCard(user.userId)
  if (!card) return null
  
  // Build public URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const publicUrl = `${appUrl}/legacy/${card.public_token}`
  
  // Count sections included
  const sectionsIncluded = [
    card.include_identity,
    card.include_networth,
    card.include_bodyfit,
    card.include_food,
    card.include_lifestyle
  ].filter(Boolean).length
  
  return {
    user: {
      userId: user.userId,
      hushhUid: user.hushhUid
    },
    card,
    publicUrl,
    sectionsIncluded,
    qrCodeContent: publicUrl
  }
}

/**
 * Generate textual preview for /legacy/create page
 */
async function generateTextualPreview(
  userId: string, 
  dimensions: LegacyDimension[]
): Promise<string[]> {
  const preview: string[] = []
  
  // Get form data for included dimensions
  for (const dimension of dimensions) {
    if (!dimension.include || !dimension.hasData) continue
    
    try {
      const formData = await getFormData(dimension.key, userId)
      if (!formData) continue
      
      let summary: string | null = null
      
      switch (dimension.key) {
        case 'identity':
          summary = generateIdentitySummary(formData.data as any)
          break
        case 'networth':
          summary = generateNetWorthSummary(formData.data as any)
          break
        case 'bodyfit':
          summary = generateBodyFitSummary(formData.data as any)
          break
        case 'food':
          summary = generateFoodSummary(formData.data as any)
          break
        case 'lifestyle':
          summary = generateLifestyleSummary(formData.data as any)
          break
      }
      
      if (summary) {
        preview.push(summary)
      }
    } catch (error) {
      console.error(`Error generating preview for ${dimension.key}:`, error)
    }
  }
  
  return preview
}

/**
 * Validate legacy card payload before creation
 */
export function validateLegacyCardPayload(
  payload: LegacyCardPayload,
  dimensions: LegacyDimension[]
): { isValid: boolean; error?: string } {
  // Check if at least one dimension is included and has data
  const hasValidIncludes = dimensions.some(dim => 
    dim.hasData && payload[`include_${dim.key}` as keyof LegacyCardPayload]
  )
  
  if (!hasValidIncludes) {
    return {
      isValid: false,
      error: "Please include at least one section before generating your card."
    }
  }
  
  return { isValid: true }
}

/**
 * Development helper: Log legacy card data
 */
export async function debugLegacyCard(userId: string): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return
  
  try {
    const card = await getLegacyCard(userId)
    console.log('🎴 [DEBUG] Legacy Card for user:', userId, {
      hasCard: !!card,
      card: card || null
    })
  } catch (error) {
    console.error('🚨 [DEBUG] Error fetching legacy card:', error)
  }
}
