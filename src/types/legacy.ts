// TypeScript types for legacy cards - Step 4

export interface LegacyCard {
  id: string
  user_id: string
  public_token: string
  card_title: string
  include_identity: boolean
  include_networth: boolean
  include_bodyfit: boolean
  include_food: boolean
  include_lifestyle: boolean
  created_at: string
  updated_at: string
  last_viewed_at?: string
}

export interface LegacyCardPayload {
  include_identity: boolean
  include_networth: boolean
  include_bodyfit: boolean
  include_food: boolean
  include_lifestyle: boolean
}

// Dimension info for /legacy/create UI
export interface LegacyDimension {
  key: 'identity' | 'networth' | 'bodyfit' | 'food' | 'lifestyle'
  title: string
  subtext: string
  hasData: boolean
  include: boolean
  route: string
}

// Data for /legacy/create page
export interface LegacyCreateData {
  user: {
    userId: string
    hushhUid: string
  }
  dimensions: LegacyDimension[]
  existingCard: LegacyCard | null
  textualPreview: string[]
}

// Data for /legacy/card page
export interface LegacyCardData {
  user: {
    userId: string
    hushhUid: string
  }
  card: LegacyCard
  publicUrl: string
  sectionsIncluded: number
  qrCodeContent: string
}

// Static dimension metadata
export const LEGACY_DIMENSION_METADATA = {
  identity: {
    title: "Identity",
    subtext: "Name, age and where you're from.",
    route: "/identity"
  },
  networth: {
    title: "Net worth", 
    subtext: "A high-level band of what you own and owe.",
    route: "/networth"
  },
  bodyfit: {
    title: "Body & fit",
    subtext: "Your sizes and fit preferences.", 
    route: "/bodyfit"
  },
  food: {
    title: "Food preferences",
    subtext: "Diet, allergies and favourite cuisines.",
    route: "/food"
  },
  lifestyle: {
    title: "Lifestyle",
    subtext: "High-level drinking and smoking habits.",
    route: "/lifestyle"
  }
} as const

// Default include flags according to specification
export const LEGACY_DEFAULT_INCLUDES = {
  identity: true,   // ON - user-facing, safe/useful
  networth: false,  // OFF - sensitive
  bodyfit: true,    // ON - user-facing, safe/useful  
  food: true,       // ON - user-facing, safe/useful
  lifestyle: false  // OFF - sensitive
} as const
