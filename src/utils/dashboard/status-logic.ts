// Dashboard status calculation logic - Step 3 specification
import { FormStatus } from '@/types/dashboard'
import { 
  IdentityData, 
  NetWorthData, 
  BodyFitData, 
  FoodData, 
  LifestyleData 
} from '@/types/forms'

// Helper to check if value is non-empty
function isNonEmpty(value: any): boolean {
  if (value === null || value === undefined || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

// Helper to check if number is > 0
function isPositiveNumber(value: any): boolean {
  return typeof value === 'number' && value > 0
}

/**
 * Calculate Identity form status according to Step 3 rules
 */
export function calculateIdentityStatus(data: IdentityData | null): FormStatus {
  if (!data) return "not_started"
  
  const { full_name, preferred_name, city, country } = data
  
  // Check if at least 1 field exists for in_progress
  const hasAtLeastOne = [full_name, preferred_name, city, country].some(isNonEmpty)
  if (!hasAtLeastOne) return "not_started"
  
  // Check completed condition: preferred_name AND city AND country
  if (isNonEmpty(preferred_name) && isNonEmpty(city) && isNonEmpty(country)) {
    return "completed"
  }
  
  return "in_progress"
}

/**
 * Calculate Net Worth form status
 */
export function calculateNetWorthStatus(data: NetWorthData | null): FormStatus {
  if (!data) return "not_started"
  
  const { assets, liabilities, sharing } = data
  
  // Check in_progress: any asset or liability > 0
  const hasAssetValue = assets && Object.values(assets).some(isPositiveNumber)
  const hasLiabilityValue = liabilities && Object.values(liabilities).some(isPositiveNumber)
  
  if (!hasAssetValue && !hasLiabilityValue) return "not_started"
  
  // Check completed: sharing.mode set AND (mode == "hide" OR mode == "band" with selected_band)
  if (!sharing?.mode) return "in_progress"
  
  if (sharing.mode === "hide") return "completed"
  if (sharing.mode === "band" && isNonEmpty(sharing.selected_band)) return "completed"
  if (sharing.mode === "range") return "completed" // Add range support
  
  return "in_progress"
}

/**
 * Calculate Body & Fit form status
 */
export function calculateBodyFitStatus(data: BodyFitData | null): FormStatus {
  if (!data) return "not_started"
  
  const { top_size, height, shoe, fit_preference } = data
  
  // Check in_progress: at least one of top_size, height.value, shoe.size
  const hasTopSize = isNonEmpty(top_size)
  const hasHeight = height?.value && height.value > 0
  const hasShoeSize = shoe?.size && shoe.size > 0
  
  if (!hasTopSize && !hasHeight && !hasShoeSize) return "not_started"
  
  // Check completed: top_size AND height.value AND fit_preference
  if (hasTopSize && hasHeight && isNonEmpty(fit_preference)) {
    return "completed"
  }
  
  return "in_progress"
}

/**
 * Calculate Food form status  
 */
export function calculateFoodStatus(data: FoodData | null): FormStatus {
  if (!data) return "not_started"
  
  const { diet_type, allergies, cuisines_like, spice_tolerance } = data
  
  // Check in_progress: at least one of diet_type, allergies non-empty, cuisines_like non-empty
  const hasDietType = isNonEmpty(diet_type)
  const hasAllergies = isNonEmpty(allergies)
  const hasCuisinesLike = isNonEmpty(cuisines_like)
  
  if (!hasDietType && !hasAllergies && !hasCuisinesLike) return "not_started"
  
  // Check completed: diet_type AND spice_tolerance
  if (hasDietType && isNonEmpty(spice_tolerance)) {
    return "completed"
  }
  
  return "in_progress"
}

/**
 * Calculate Lifestyle form status
 */
export function calculateLifestyleStatus(data: LifestyleData | null): FormStatus {
  if (!data) return "not_started"
  
  const { drinking, smoking } = data
  
  // Check in_progress: drinking.status set OR smoking.status set
  const hasDrinkingStatus = isNonEmpty(drinking?.status)
  const hasSmokingStatus = isNonEmpty(smoking?.status)
  
  if (!hasDrinkingStatus && !hasSmokingStatus) return "not_started"
  
  // Check completed: drinking.status set AND smoking.status set
  if (hasDrinkingStatus && hasSmokingStatus) {
    return "completed"
  }
  
  return "in_progress"
}

/**
 * Generate Identity summary according to spec
 */
export function generateIdentitySummary(data: IdentityData | null): string | null {
  if (!data) return null
  
  const { preferred_name, age_computed, city, country } = data
  
  // Priority: "Ankit · 27 · Pune, India" if preferred_name, age & city available
  if (isNonEmpty(preferred_name) && age_computed && isNonEmpty(city)) {
    const locationPart = isNonEmpty(country) ? `${city}, ${country}` : city
    return `${preferred_name} · ${age_computed} · ${locationPart}`
  }
  
  // Fallback combinations
  const parts: string[] = []
  if (isNonEmpty(preferred_name)) parts.push(preferred_name!)
  if (age_computed) parts.push(age_computed.toString())
  if (isNonEmpty(city)) {
    const locationPart = isNonEmpty(country) ? `${city}, ${country}` : city!
    parts.push(locationPart)
  }
  
  return parts.length > 0 ? parts.join(' · ') : null
}

/**
 * Generate Net Worth summary
 */
export function generateNetWorthSummary(data: NetWorthData | null): string | null {
  if (!data?.sharing) return null
  
  const { sharing } = data
  
  if (sharing.mode === "band" && isNonEmpty(sharing.selected_band)) {
    return `Net worth band: ${sharing.selected_band}`
  }
  
  if (sharing.mode === "hide") {
    return "Net worth: Hidden"
  }
  
  return "Net worth: Not set"
}

/**
 * Generate Body & Fit summary
 */
export function generateBodyFitSummary(data: BodyFitData | null): string | null {
  if (!data) return null
  
  const { top_size, height, fit_preference, shoe } = data
  
  const parts: string[] = []
  
  // Priority: "Top M · 175 cm · Regular fit"
  if (isNonEmpty(top_size) && height?.value && isNonEmpty(fit_preference)) {
    return `Top ${top_size} · ${height.value} ${height.unit || 'cm'} · ${fit_preference} fit`
  }
  
  // Fallback combinations
  if (isNonEmpty(top_size)) parts.push(`Top ${top_size}`)
  if (height?.value) parts.push(`${height.value} ${height.unit || 'cm'}`)
  if (shoe?.size) {
    const shoeText = `Shoe ${shoe.size}${shoe.system ? ` ${shoe.system}` : ''}`
    parts.push(shoeText)
  }
  if (isNonEmpty(fit_preference)) parts.push(`${fit_preference!} fit`)
  
  return parts.length > 0 ? parts.join(' · ') : null
}

/**
 * Generate Food summary
 */
export function generateFoodSummary(data: FoodData | null): string | null {
  if (!data) return null
  
  const { diet_type, spice_tolerance, cuisines_like } = data
  
  const parts: string[] = []
  
  // Priority: "Vegetarian · Medium spice"
  if (isNonEmpty(diet_type)) parts.push(diet_type!)
  if (isNonEmpty(spice_tolerance)) parts.push(`${spice_tolerance!} spice`)
  
  // Optionally add one favourite cuisine
  if (cuisines_like && cuisines_like.length > 0) {
    parts.push(`Loves ${cuisines_like[0]}`)
  }
  
  return parts.length > 0 ? parts.join(' · ') : null
}

/**
 * Generate Lifestyle summary
 */
export function generateLifestyleSummary(data: LifestyleData | null): string | null {
  if (!data) return null
  
  const { drinking, smoking } = data
  
  const parts: string[] = []
  
  // "Drinks occasionally · Non-smoker"
  if (drinking?.status) {
    const drinkingText = drinking.status === "no" ? "Non-drinker" :
                        drinking.status === "occasionally" ? "Drinks occasionally" :
                        drinking.status === "often" ? "Drinks often" : "Drinking status private"
    parts.push(drinkingText)
  }
  
  if (smoking?.status) {
    const smokingText = smoking.status === "no" ? "Non-smoker" :
                       smoking.status === "occasionally" ? "Smokes occasionally" :
                       smoking.status === "daily" ? "Daily smoker" :
                       smoking.status === "former" ? "Former smoker" : "Smoking status private"
    parts.push(smokingText)
  }
  
  return parts.length > 0 ? parts.join(' · ') : null
}
