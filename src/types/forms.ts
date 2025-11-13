// TypeScript types for form data structures
// Based on STEP 2 specification

export type VisibilityLevel = "public" | "trusted" | "private"

// Common interface for all profile tables
export interface BaseProfile {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

// Form keys
export type FormKey = "identity" | "networth" | "bodyfit" | "food" | "lifestyle"

// ============================================================================
// 1. IDENTITY PROFILES
// ============================================================================

export interface IdentityData {
  full_name?: string
  preferred_name?: string
  date_of_birth?: string // YYYY-MM-DD format
  share_year_only?: boolean
  sex_at_birth?: "male" | "female" | "intersex" | "prefer_not_to_say"
  gender_identity?: "man" | "woman" | "non_binary" | "other" | "prefer_not_to_say"
  pronouns?: string
  city?: string
  country?: string
  email?: string
  phone?: string
  age_computed?: number
}

export interface IdentityVisibility {
  full_name?: VisibilityLevel
  preferred_name?: VisibilityLevel
  age?: VisibilityLevel
  city?: VisibilityLevel
  country?: VisibilityLevel
  email?: VisibilityLevel
  phone?: VisibilityLevel
  sex_at_birth?: VisibilityLevel
  gender_identity?: VisibilityLevel
  pronouns?: VisibilityLevel
}

export interface IdentityProfile extends BaseProfile {
  data: IdentityData
  visibility: IdentityVisibility
}

// ============================================================================
// 2. NET WORTH PROFILES
// ============================================================================

export interface NetWorthAssets {
  cash_and_bank?: number
  investments_brokerage?: number
  retirement_accounts?: number
  real_estate_equity?: number
  vehicles_equity?: number
  other_assets?: number
}

export interface NetWorthLiabilities {
  mortgage_balance?: number
  education_loans?: number
  credit_cards_personal_loans?: number
  other_liabilities?: number
}

export interface NetWorthSharing {
  mode: "hide" | "band" | "range"
  selected_band?: string // e.g., "50k-100k"
  use_range_estimates?: boolean
}

export interface NetWorthData {
  assets?: NetWorthAssets
  liabilities?: NetWorthLiabilities
  sharing: NetWorthSharing
  networth_computed?: number
}

export interface NetWorthVisibility {
  networth_band?: VisibilityLevel
  detailed_assets?: VisibilityLevel
  detailed_liabilities?: VisibilityLevel
}

export interface NetWorthProfile extends BaseProfile {
  data: NetWorthData
  visibility: NetWorthVisibility
}

// ============================================================================
// 3. BODY & FIT PROFILES
// ============================================================================

export interface BodyFitHeight {
  value: number
  unit: "cm" | "ft_in"
}

export interface BodyFitWeight {
  value: number
  unit: "kg" | "lbs"
  provided: boolean
}

export interface BodyFitShoe {
  size: number
  system: "EU" | "US" | "UK"
  width?: "narrow" | "regular" | "wide"
}

export interface BodyFitQRVisibility {
  show_top_size?: boolean
  show_shoe_size?: boolean
  show_detailed_measurements?: boolean
  show_fit_preference?: boolean
}

export interface BodyFitData {
  height?: BodyFitHeight
  weight?: BodyFitWeight
  fit_preference?: "slim" | "regular" | "relaxed"
  top_size?: string
  chest?: number
  waist?: number
  inseam?: number
  shoe?: BodyFitShoe
  ring_size?: string
  wrist_circumference?: number
  body_notes?: string
  qr_visibility?: BodyFitQRVisibility
}

export interface BodyFitVisibility {
  top_size?: VisibilityLevel
  shoe?: VisibilityLevel
  measurements?: VisibilityLevel
  body_notes?: VisibilityLevel
}

export interface BodyFitProfile extends BaseProfile {
  data: BodyFitData
  visibility: BodyFitVisibility
}

// ============================================================================
// 4. FOOD PREFERENCES
// ============================================================================

export interface FoodAllergy {
  name: string
  severity: "mild" | "moderate" | "severe"
}

export interface FoodQRVisibility {
  enabled: boolean
  show_diet_type?: boolean
  show_allergies?: boolean
  show_cuisine_likes?: boolean
  show_intolerances?: boolean
}

export interface FoodData {
  diet_type?: string
  spice_tolerance?: "low" | "medium" | "high"
  sweet_preference?: number // 0-10
  salt_preference?: number // 0-10
  allergies?: FoodAllergy[]
  intolerances?: string[]
  cuisines_like?: string[]
  cuisines_avoid?: string[]
  go_to_dishes?: string
  meal_pattern?: string
  non_alcoholic_beverages?: string[]
  qr_visibility?: FoodQRVisibility
}

export interface FoodVisibility {
  diet_type?: VisibilityLevel
  allergies?: VisibilityLevel
  intolerances?: VisibilityLevel
  cuisines_like?: VisibilityLevel
  cuisines_avoid?: VisibilityLevel
  go_to_dishes?: VisibilityLevel
}

export interface FoodProfile extends BaseProfile {
  data: FoodData
  visibility: FoodVisibility
}

// ============================================================================
// 5. LIFESTYLE PROFILES
// ============================================================================

export interface LifestyleDrinking {
  status: "no" | "occasionally" | "often" | "prefer_not_to_say"
  frequency?: string
  typical_quantity?: string
  preferred_drinks?: string[]
  typical_budget_per_drink?: number
}

export interface LifestyleSmoking {
  status: "no" | "occasionally" | "daily" | "former"
  type?: string
  quantity?: string
  quit_year?: number
}

export interface LifestyleSharing {
  mode: "hide" | "high_level"
}

export interface LifestyleData {
  drinking?: LifestyleDrinking
  smoking?: LifestyleSmoking
  sharing: LifestyleSharing
}

export interface LifestyleVisibility {
  drinking_high_level?: VisibilityLevel
  smoking_high_level?: VisibilityLevel
  detailed_drinking?: VisibilityLevel
  detailed_smoking?: VisibilityLevel
}

export interface LifestyleProfile extends BaseProfile {
  data: LifestyleData
  visibility: LifestyleVisibility
}

// ============================================================================
// UNION TYPES FOR GENERIC OPERATIONS
// ============================================================================

export type ProfileData = 
  | IdentityData 
  | NetWorthData 
  | BodyFitData 
  | FoodData 
  | LifestyleData

export type ProfileVisibility = 
  | IdentityVisibility 
  | NetWorthVisibility 
  | BodyFitVisibility 
  | FoodVisibility 
  | LifestyleVisibility

export type Profile = 
  | IdentityProfile 
  | NetWorthProfile 
  | BodyFitProfile 
  | FoodProfile 
  | LifestyleProfile

// Helper type to map form keys to specific types
export type FormDataMap = {
  identity: IdentityData
  networth: NetWorthData
  bodyfit: BodyFitData
  food: FoodData
  lifestyle: LifestyleData
}

export type FormVisibilityMap = {
  identity: IdentityVisibility
  networth: NetWorthVisibility
  bodyfit: BodyFitVisibility
  food: FoodVisibility
  lifestyle: LifestyleVisibility
}

export type FormProfileMap = {
  identity: IdentityProfile
  networth: NetWorthProfile
  bodyfit: BodyFitProfile
  food: FoodProfile
  lifestyle: LifestyleProfile
}
