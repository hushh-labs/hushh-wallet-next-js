// Dashboard view model types for Step 3

export type FormStatus = "not_started" | "in_progress" | "completed"

export interface FormCardData {
  key: "identity" | "networth" | "bodyfit" | "food" | "lifestyle"
  title: string
  description: string
  status: FormStatus
  summary: string | null
  route: string
}

export interface DashboardData {
  formCards: FormCardData[]
  isLegacyCTAEnabled: boolean
  user: {
    userId: string
    hushhUid: string
  }
}

// Static form card metadata
export const FORM_CARD_METADATA: Record<string, { title: string; description: string; route: string }> = {
  identity: {
    title: "Identity",
    description: "Basic details about who you are.",
    route: "/identity"
  },
  networth: {
    title: "Net Worth", 
    description: "A private snapshot of what you own and owe.",
    route: "/networth"
  },
  bodyfit: {
    title: "Body & Fit",
    description: "Your sizes and fit preferences.",
    route: "/bodyfit"
  },
  food: {
    title: "Food",
    description: "What you eat, love and avoid.",
    route: "/food"
  },
  lifestyle: {
    title: "Lifestyle",
    description: "Habits around drinking and smoking.",
    route: "/lifestyle"
  }
}
