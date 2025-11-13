// TypeScript types for public viewer - Step 5

export interface PublicSection {
  visible: boolean
  lines: string[]
}

export interface PublicProfileData {
  sections: {
    identity: PublicSection
    networth: PublicSection
    bodyfit: PublicSection
    food: PublicSection
    lifestyle: PublicSection
  }
  hasAnyVisibleSections: boolean
  cardTitle: string
  lastUpdated?: string
}

export interface PublicViewerPageProps {
  params: {
    public_token: string
  }
}

// Error states for public viewer
export type PublicViewerError = 
  | 'not_found'       // Invalid/expired token
  | 'empty_profile'   // Card exists but no visible data
  | 'server_error'    // Unexpected error

export interface PublicViewerResult {
  success: boolean
  error?: PublicViewerError
  data?: PublicProfileData
}
