// Dashboard data service - Step 3
import { getCurrentUser } from '@/utils/auth/anonymous'
import { getFormData } from '@/utils/forms/operations'
import { DashboardData, FormCardData, FORM_CARD_METADATA } from '@/types/dashboard'
import { FormKey } from '@/types/forms'
import {
  calculateIdentityStatus,
  calculateNetWorthStatus,
  calculateBodyFitStatus,
  calculateFoodStatus,
  calculateLifestyleStatus,
  generateIdentitySummary,
  generateNetWorthSummary,
  generateBodyFitSummary,
  generateFoodSummary,
  generateLifestyleSummary
} from './status-logic'

/**
 * Fetch and compute dashboard data according to Step 3 specification
 */
export async function getDashboardData(): Promise<DashboardData> {
  // 1. Get current anonymous user
  const user = await getCurrentUser()
  
  // 2. Fetch all form data in parallel
  const [identityData, networthData, bodyfitData, foodData, lifestyleData] = await Promise.all([
    getFormData('identity', user.userId).catch(() => null),
    getFormData('networth', user.userId).catch(() => null), 
    getFormData('bodyfit', user.userId).catch(() => null),
    getFormData('food', user.userId).catch(() => null),
    getFormData('lifestyle', user.userId).catch(() => null)
  ])

  // 3. Calculate status and summary for each form
  const formCards: FormCardData[] = [
    {
      key: 'identity',
      ...FORM_CARD_METADATA.identity,
      status: calculateIdentityStatus(identityData?.data || null),
      summary: generateIdentitySummary(identityData?.data || null)
    },
    {
      key: 'networth',
      ...FORM_CARD_METADATA.networth,
      status: calculateNetWorthStatus(networthData?.data || null),
      summary: generateNetWorthSummary(networthData?.data || null)
    },
    {
      key: 'bodyfit',
      ...FORM_CARD_METADATA.bodyfit,
      status: calculateBodyFitStatus(bodyfitData?.data || null),
      summary: generateBodyFitSummary(bodyfitData?.data || null)
    },
    {
      key: 'food',
      ...FORM_CARD_METADATA.food,
      status: calculateFoodStatus(foodData?.data || null),
      summary: generateFoodSummary(foodData?.data || null)
    },
    {
      key: 'lifestyle',
      ...FORM_CARD_METADATA.lifestyle,
      status: calculateLifestyleStatus(lifestyleData?.data || null),
      summary: generateLifestyleSummary(lifestyleData?.data || null)
    }
  ]

  // 4. Calculate Legacy CTA status
  // Business rule: enabled if at least one form has status != "not_started"
  const isLegacyCTAEnabled = formCards.some(card => 
    card.status === "in_progress" || card.status === "completed"
  )

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Dashboard data computed:', {
      userId: user.userId,
      formStatuses: formCards.map(card => ({ [card.key]: card.status })),
      isLegacyCTAEnabled,
      summaries: formCards.map(card => ({ [card.key]: card.summary }))
    })
  }

  return {
    formCards,
    isLegacyCTAEnabled,
    user: {
      userId: user.userId,
      hushhUid: user.hushhUid
    }
  }
}

/**
 * Helper to get status pill styling
 */
export function getStatusPillStyle(status: FormCardData['status']) {
  switch (status) {
    case 'not_started':
      return 'bg-gray-100 text-gray-600 border border-gray-200'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    case 'completed':
      return 'bg-green-100 text-green-800 border border-green-200'
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-200'
  }
}

/**
 * Helper to get status pill text
 */
export function getStatusText(status: FormCardData['status']) {
  switch (status) {
    case 'not_started':
      return 'Not started'
    case 'in_progress':
      return 'In progress'
    case 'completed':
      return 'Completed'
    default:
      return 'Not started'
  }
}

/**
 * Get CTA button styling based on enabled state
 */
export function getCTAButtonStyle(enabled: boolean) {
  if (enabled) {
    return 'bg-black text-white border border-black hover:bg-gray-800 transition-colors'
  }
  return 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
}

/**
 * Get CTA helper text based on enabled state
 */
export function getCTAHelperText(enabled: boolean) {
  if (enabled) {
    return "We'll use your saved answers to build a personalized card and QR."
  }
  return "Fill at least one card above to unlock your legacy card."
}
