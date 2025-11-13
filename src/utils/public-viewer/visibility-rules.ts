// Public viewer visibility rules - Step 5
import { 
  IdentityData, 
  IdentityVisibility,
  NetWorthData,
  NetWorthVisibility,
  BodyFitData,
  BodyFitVisibility,
  FoodData,
  FoodVisibility,
  LifestyleData,
  LifestyleVisibility
} from '@/types/forms'
import { LegacyCard } from '@/types/legacy'
import { PublicSection } from '@/types/public-viewer'

// Helper to check if value is non-empty
function isNonEmpty(value: any): boolean {
  if (value === null || value === undefined || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

/**
 * Build Identity section for public viewer
 */
export function buildIdentitySection(
  data: IdentityData | null,
  visibility: IdentityVisibility | null,
  includeFlag: boolean
): PublicSection {
  if (!includeFlag || !data || !visibility) {
    return { visible: false, lines: [] }
  }

  const lines: string[] = []

  // Name (preferred_name or fallback to full_name)
  let name: string | null = null
  if (isNonEmpty(data.preferred_name) && visibility.preferred_name === 'public') {
    name = data.preferred_name!
  } else if (isNonEmpty(data.full_name) && visibility.full_name === 'public') {
    name = data.full_name!
  }
  if (name) {
    lines.push(`Name: ${name}`)
  }

  // Age
  if (visibility.age === 'public') {
    if (data.age_computed) {
      if (data.share_year_only) {
        lines.push(`Born: ${new Date().getFullYear() - data.age_computed}`)
      } else {
        lines.push(`Age: ${data.age_computed}`)
      }
    }
  }

  // Location (city + country)
  const locationParts: string[] = []
  if (isNonEmpty(data.city) && visibility.city === 'public') {
    locationParts.push(data.city!)
  }
  if (isNonEmpty(data.country) && visibility.country === 'public') {
    locationParts.push(data.country!)
  }
  if (locationParts.length > 0) {
    lines.push(`Location: ${locationParts.join(', ')}`)
  }

  return {
    visible: lines.length > 0,
    lines
  }
}

/**
 * Build Net Worth section for public viewer
 */
export function buildNetWorthSection(
  data: NetWorthData | null,
  visibility: NetWorthVisibility | null,
  includeFlag: boolean
): PublicSection {
  if (!includeFlag || !data || !visibility || !data.sharing) {
    return { visible: false, lines: [] }
  }

  const { sharing } = data
  const lines: string[] = []

  // Don't show if mode is hide
  if (sharing.mode === 'hide') {
    return { visible: false, lines: [] }
  }

  // Check if networth info is public
  if (visibility.networth_band !== 'public') {
    return { visible: false, lines: [] }
  }

  // Show based on sharing mode
  if (sharing.mode === 'band' && isNonEmpty(sharing.selected_band)) {
    lines.push(`Net worth band: ${sharing.selected_band}`)
  } else if (sharing.mode === 'range' && isNonEmpty(sharing.selected_band)) {
    lines.push(`Net worth range: ${sharing.selected_band}`)
  }

  return {
    visible: lines.length > 0,
    lines
  }
}

/**
 * Build Body & Fit section for public viewer
 */
export function buildBodyFitSection(
  data: BodyFitData | null,
  visibility: BodyFitVisibility | null,
  includeFlag: boolean
): PublicSection {
  if (!includeFlag || !data || !visibility || !data.qr_visibility) {
    return { visible: false, lines: [] }
  }

  const { qr_visibility } = data
  const lines: string[] = []

  // Top size
  if (qr_visibility.show_top_size && 
      visibility.top_size === 'public' && 
      isNonEmpty(data.top_size)) {
    lines.push(`Top: ${data.top_size}`)
  }

  // Height (if detailed measurements allowed)
  if (qr_visibility.show_detailed_measurements && 
      visibility.measurements === 'public' && 
      data.height?.value) {
    lines.push(`Height: ${data.height.value} ${data.height.unit || 'cm'}`)
  }

  // Fit preference
  if (qr_visibility.show_fit_preference && 
      isNonEmpty(data.fit_preference)) {
    lines.push(`Fit: ${data.fit_preference}`)
  }

  // Shoe size
  if (qr_visibility.show_shoe_size && 
      visibility.shoe === 'public' && 
      data.shoe?.size) {
    lines.push(`Shoe: ${data.shoe.size}${data.shoe.system ? ` ${data.shoe.system}` : ''}`)
  }

  // Detailed measurements (only if explicitly allowed)
  if (qr_visibility.show_detailed_measurements && visibility.measurements === 'public') {
    if (data.chest) {
      lines.push(`Chest: ${data.chest} cm`)
    }
    if (data.waist && data.inseam) {
      lines.push(`Waist: ${data.waist} in · Inseam: ${data.inseam} in`)
    }
  }

  return {
    visible: lines.length > 0,
    lines
  }
}

/**
 * Build Food section for public viewer
 */
export function buildFoodSection(
  data: FoodData | null,
  visibility: FoodVisibility | null,
  includeFlag: boolean
): PublicSection {
  if (!includeFlag || !data || !visibility || !data.qr_visibility?.enabled) {
    return { visible: false, lines: [] }
  }

  const { qr_visibility } = data
  const lines: string[] = []

  // Diet type
  if (qr_visibility.show_diet_type && 
      visibility.diet_type === 'public' && 
      isNonEmpty(data.diet_type)) {
    lines.push(`Diet: ${data.diet_type}`)
  }

  // Spice tolerance
  if (visibility.diet_type === 'public' && isNonEmpty(data.spice_tolerance)) {
    lines.push(`Spice: ${data.spice_tolerance}`)
  }

  // Allergies
  if (qr_visibility.show_allergies && 
      visibility.allergies === 'public' && 
      data.allergies && data.allergies.length > 0) {
    const allergyText = data.allergies
      .map(allergy => `${allergy.name} (${allergy.severity})`)
      .join(', ')
    lines.push(`Allergies: ${allergyText}`)
  }

  // Intolerances
  if (qr_visibility.show_intolerances && 
      visibility.intolerances === 'public' && 
      data.intolerances && data.intolerances.length > 0) {
    lines.push(`Intolerances: ${data.intolerances.join(', ')}`)
  }

  // Favourite cuisines
  if (qr_visibility.show_cuisine_likes && 
      visibility.cuisines_like === 'public' && 
      data.cuisines_like && data.cuisines_like.length > 0) {
    lines.push(`Loves: ${data.cuisines_like.join(', ')}`)
  }

  // Cuisines to avoid
  if (visibility.cuisines_avoid === 'public' && 
      data.cuisines_avoid && data.cuisines_avoid.length > 0) {
    lines.push(`Avoids: ${data.cuisines_avoid.join(', ')}`)
  }

  return {
    visible: lines.length > 0,
    lines
  }
}

/**
 * Build Lifestyle section for public viewer
 */
export function buildLifestyleSection(
  data: LifestyleData | null,
  visibility: LifestyleVisibility | null,
  includeFlag: boolean
): PublicSection {
  if (!includeFlag || !data || !visibility || !data.sharing) {
    return { visible: false, lines: [] }
  }

  const { sharing } = data
  const lines: string[] = []

  // Don't show if mode is hide
  if (sharing.mode === 'hide') {
    return { visible: false, lines: [] }
  }

  // High-level mode only
  if (sharing.mode === 'high_level') {
    // Drinking
    if (visibility.drinking_high_level === 'public' && data.drinking?.status) {
      let drinkingText = ''
      switch (data.drinking.status) {
        case 'no':
          drinkingText = 'Doesn\'t drink'
          break
        case 'occasionally':
          drinkingText = 'Drinks occasionally'
          break
        case 'often':
          drinkingText = 'Drinks regularly'
          break
        case 'prefer_not_to_say':
          drinkingText = 'Prefers not to say'
          break
      }
      if (drinkingText) {
        lines.push(`Drinking: ${drinkingText}`)
      }
    }

    // Smoking
    if (visibility.smoking_high_level === 'public' && data.smoking?.status) {
      let smokingText = ''
      switch (data.smoking.status) {
        case 'no':
          smokingText = 'Non-smoker'
          break
        case 'occasionally':
          smokingText = 'Smokes occasionally'
          break
        case 'daily':
          smokingText = 'Smokes daily'
          break
        case 'former':
          smokingText = 'Former smoker'
          break
      }
      if (smokingText) {
        lines.push(`Smoking: ${smokingText}`)
      }
    }
  }

  return {
    visible: lines.length > 0,
    lines
  }
}
