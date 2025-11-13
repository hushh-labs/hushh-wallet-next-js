// Common form framework - Step 6 (Client-side API version)
import { FormKey, FormDataMap, FormVisibilityMap } from '@/types/forms'

export interface FormState<T extends FormKey> {
  loading: boolean
  saving: boolean
  data: FormDataMap[T]
  visibility: FormVisibilityMap[T]
  originalData: FormDataMap[T]
  originalVisibility: FormVisibilityMap[T]
  hasUnsavedChanges: boolean
  error: string | null
  saveSuccess: boolean
}

export interface FormActions<T extends FormKey> {
  updateData: (updates: Partial<FormDataMap[T]>) => void
  updateVisibility: (updates: Partial<FormVisibilityMap[T]>) => void
  save: () => Promise<void>
  reset: () => void
  markClean: () => void
}

/**
 * Load initial form data for a specific form (client-side)
 */
export async function loadFormData<T extends FormKey>(
  formKey: T
): Promise<{
  data: FormDataMap[T]
  visibility: FormVisibilityMap[T]
  userId: string
}> {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(`/api/forms/${formKey}`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown API error')
    }
    
    return {
      data: result.data.data as FormDataMap[T],
      visibility: result.data.visibility as FormVisibilityMap[T],
      userId: result.data.userId
    }
  } catch (error) {
    console.error(`Error loading ${formKey} form:`, error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.')
      }
      throw error
    }
    
    throw new Error('Failed to load form data')
  }
}

/**
 * Save form data using API route (client-side)
 */
export async function saveFormData<T extends FormKey>(
  formKey: T,
  userId: string,
  data: FormDataMap[T],
  visibility: FormVisibilityMap[T]
): Promise<void> {
  try {
    const response = await fetch(`/api/forms/${formKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, visibility })
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error(`Error saving ${formKey} form:`, error)
    throw error
  }
}

/**
 * Check if form data has changes compared to original
 */
export function hasFormChanges<T extends FormKey>(
  current: { data: FormDataMap[T]; visibility: FormVisibilityMap[T] },
  original: { data: FormDataMap[T]; visibility: FormVisibilityMap[T] }
): boolean {
  return (
    JSON.stringify(current.data) !== JSON.stringify(original.data) ||
    JSON.stringify(current.visibility) !== JSON.stringify(original.visibility)
  )
}

/**
 * Common form metadata
 */
export const FORM_METADATA = {
  identity: {
    title: "Identity",
    description: "Basic details about who you are.",
    helpText: "We recommend keeping contact details private in your public QR."
  },
  networth: {
    title: "Net Worth",
    description: "A private snapshot of what you own and owe.",
    helpText: "Only high-level bands will be shown publicly, never exact amounts."
  },
  bodyfit: {
    title: "Body & Fit",
    description: "Your sizes and fit preferences.",
    helpText: "Choose what appears on your QR for shopping and gifting."
  },
  food: {
    title: "Food",
    description: "What you eat, love and avoid.",
    helpText: "Diet type and allergies are most useful for public view."
  },
  lifestyle: {
    title: "Lifestyle",
    description: "Habits around drinking and smoking.",
    helpText: "Only high-level status will be shared, never detailed quantities."
  }
} as const

/**
 * Common visibility options
 */
export const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Visible on your QR card' },
  { value: 'trusted', label: 'Trusted', description: 'Only for people you trust' },
  { value: 'private', label: 'Private', description: 'Never shared publicly' }
] as const

/**
 * Toast messages
 */
export const TOAST_MESSAGES = {
  saveSuccess: "Saved · Your legacy card will use these answers.",
  saveError: "We couldn't save your answers. Please try again.",
  loadError: "Failed to load your data. Please refresh the page.",
  unsavedChanges: "You have unsaved changes. Discard them?"
} as const
