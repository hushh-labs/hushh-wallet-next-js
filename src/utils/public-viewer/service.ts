// Public viewer service - Step 5
import { createClient } from '@/utils/supabase/server'
import { getFormData } from '@/utils/forms/operations'
import { LegacyCard } from '@/types/legacy'
import { PublicProfileData, PublicViewerResult } from '@/types/public-viewer'
import { 
  buildIdentitySection,
  buildNetWorthSection,
  buildBodyFitSection,
  buildFoodSection,
  buildLifestyleSection
} from './visibility-rules'

/**
 * Get legacy card by public token
 */
async function getLegacyCardByToken(publicToken: string): Promise<LegacyCard | null> {
  try {
    const supabase = await createClient()
    
    const { data: card, error } = await supabase
      .from('legacy_cards')
      .select('*')
      .eq('public_token', publicToken)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null
      }
      throw new Error(`Failed to get legacy card: ${error.message}`)
    }

    return card as LegacyCard
  } catch (error) {
    console.error('Error getting legacy card by token:', error)
    return null
  }
}

/**
 * Update last_viewed_at timestamp for analytics
 */
async function updateLastViewed(publicToken: string): Promise<void> {
  try {
    const supabase = await createClient()
    
    await supabase
      .from('legacy_cards')
      .update({ last_viewed_at: new Date().toISOString() })
      .eq('public_token', publicToken)
  } catch (error) {
    // Don't fail the request if analytics update fails
    console.error('Failed to update last_viewed_at:', error)
  }
}

/**
 * Build public profile data from legacy card and form data
 */
export async function getPublicProfileData(publicToken: string): Promise<PublicViewerResult> {
  try {
    // Get legacy card by public token
    const legacyCard = await getLegacyCardByToken(publicToken)
    
    if (!legacyCard) {
      return {
        success: false,
        error: 'not_found'
      }
    }

    // Update last viewed timestamp (async, don't wait)
    updateLastViewed(publicToken).catch(console.error)

    // Fetch all form data for the user
    const [identityForm, networthForm, bodyfitForm, foodForm, lifestyleForm] = await Promise.all([
      getFormData('identity', legacyCard.user_id).catch(() => null),
      getFormData('networth', legacyCard.user_id).catch(() => null),
      getFormData('bodyfit', legacyCard.user_id).catch(() => null),
      getFormData('food', legacyCard.user_id).catch(() => null),
      getFormData('lifestyle', legacyCard.user_id).catch(() => null)
    ])

    // Build sections using visibility rules
    const sections = {
      identity: buildIdentitySection(
        identityForm?.data || null,
        identityForm?.visibility || null,
        legacyCard.include_identity
      ),
      networth: buildNetWorthSection(
        networthForm?.data || null,
        networthForm?.visibility || null,
        legacyCard.include_networth
      ),
      bodyfit: buildBodyFitSection(
        bodyfitForm?.data || null,
        bodyfitForm?.visibility || null,
        legacyCard.include_bodyfit
      ),
      food: buildFoodSection(
        foodForm?.data || null,
        foodForm?.visibility || null,
        legacyCard.include_food
      ),
      lifestyle: buildLifestyleSection(
        lifestyleForm?.data || null,
        lifestyleForm?.visibility || null,
        legacyCard.include_lifestyle
      )
    }

    // Check if any sections are visible
    const hasAnyVisibleSections = Object.values(sections).some(section => section.visible)
    
    if (!hasAnyVisibleSections) {
      return {
        success: false,
        error: 'empty_profile'
      }
    }

    const profileData: PublicProfileData = {
      sections,
      hasAnyVisibleSections,
      cardTitle: legacyCard.card_title,
      lastUpdated: legacyCard.updated_at
    }

    return {
      success: true,
      data: profileData
    }

  } catch (error) {
    console.error('Error building public profile:', error)
    return {
      success: false,
      error: 'server_error'
    }
  }
}

/**
 * Development helper: Log public viewer data
 */
export async function debugPublicViewer(publicToken: string): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return
  
  try {
    const result = await getPublicProfileData(publicToken)
    console.log('👁️ [DEBUG] Public viewer for token:', publicToken, {
      success: result.success,
      error: result.error,
      hasVisibleSections: result.data?.hasAnyVisibleSections,
      visibleSections: result.data ? Object.entries(result.data.sections)
        .filter(([_, section]) => section.visible)
        .map(([name]) => name) : []
    })
  } catch (error) {
    console.error('🚨 [DEBUG] Error in public viewer:', error)
  }
}
