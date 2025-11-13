'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { IdentityData, IdentityVisibility } from '@/types/forms'
import { 
  loadFormData, 
  saveFormData, 
  hasFormChanges, 
  FORM_METADATA, 
  VISIBILITY_OPTIONS,
  TOAST_MESSAGES 
} from '@/utils/forms/form-framework'

export default function IdentityForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<IdentityData>({})
  const [visibility, setVisibility] = useState<IdentityVisibility>({})
  const [originalData, setOriginalData] = useState<IdentityData>({})
  const [originalVisibility, setOriginalVisibility] = useState<IdentityVisibility>({})
  const [userId, setUserId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const hasUnsavedChanges = hasFormChanges(
    { data, visibility }, 
    { data: originalData, visibility: originalVisibility }
  )

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      
      const result = await loadFormData('identity')
      
      // Set default visibility values if not present
      const defaultVisibility: IdentityVisibility = {
        preferred_name: 'public',
        age: 'public',
        city: 'public',
        country: 'public',
        email: 'private',
        phone: 'private',
        ...result.visibility
      }
      
      setData(result.data)
      setVisibility(defaultVisibility)
      setOriginalData(result.data)
      setOriginalVisibility(defaultVisibility)
      setUserId(result.userId)
    } catch (err) {
      console.error('Error loading identity form:', err)
      setError(TOAST_MESSAGES.loadError)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setError(null)
      
      // Calculate age if date_of_birth is provided
      let dataToSave = { ...data }
      if (data.date_of_birth) {
        const birthDate = new Date(data.date_of_birth)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        dataToSave.age_computed = age
      }
      
      await saveFormData('identity', userId, dataToSave, visibility)
      
      // Update original state to mark as clean
      setOriginalData(dataToSave)
      setOriginalVisibility(visibility)
      
      // Show success message
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      
    } catch (err) {
      console.error('Error saving identity form:', err)
      setError(TOAST_MESSAGES.saveError)
    } finally {
      setSaving(false)
    }
  }

  function updateData(updates: Partial<IdentityData>) {
    setData(prev => ({ ...prev, ...updates }))
    setError(null)
  }

  function updateVisibility(field: keyof IdentityVisibility, value: 'public' | 'trusted' | 'private') {
    setVisibility(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your identity information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link 
              href="/dashboard" 
              className="text-xl font-medium text-black hover:text-gray-600 transition-colors"
            >
              ← hushh
            </Link>
            <Link 
              href="/about" 
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              What is this?
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            {FORM_METADATA.identity.title}
          </h1>
          <p className="text-gray-600 mb-4">
            {FORM_METADATA.identity.description}
          </p>
          <p className="text-sm text-gray-500">
            {FORM_METADATA.identity.helpText}
          </p>
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{TOAST_MESSAGES.saveSuccess}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
          
          {/* Names Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
              Names
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  value={data.full_name || ''}
                  onChange={(e) => updateData({ full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Your full legal name"
                />
                <select
                  value={visibility.full_name || 'private'}
                  onChange={(e) => updateVisibility('full_name', e.target.value as any)}
                  className="mt-2 px-2 py-1 text-xs border border-gray-300 rounded-md"
                >
                  {VISIBILITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred name *
                </label>
                <input
                  type="text"
                  value={data.preferred_name || ''}
                  onChange={(e) => updateData({ preferred_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="What you like to be called"
                />
                <select
                  value={visibility.preferred_name || 'public'}
                  onChange={(e) => updateVisibility('preferred_name', e.target.value as any)}
                  className="mt-2 px-2 py-1 text-xs border border-gray-300 rounded-md"
                >
                  {VISIBILITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Recommended for your public profile</p>
              </div>
            </div>
          </div>

          {/* Age/Birth Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
              Age
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of birth
              </label>
              <input
                type="date"
                value={data.date_of_birth || ''}
                onChange={(e) => updateData({ date_of_birth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              
              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  checked={data.share_year_only || false}
                  onChange={(e) => updateData({ share_year_only: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm text-gray-600">
                  Only show birth year publicly (not full age)
                </label>
              </div>
              
              <select
                value={visibility.age || 'public'}
                onChange={(e) => updateVisibility('age', e.target.value as any)}
                className="mt-2 px-2 py-1 text-xs border border-gray-300 rounded-md"
              >
                {VISIBILITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                We can show only your age or birth year on your public profile.
              </p>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={data.city || ''}
                  onChange={(e) => updateData({ city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Mumbai"
                />
                <select
                  value={visibility.city || 'public'}
                  onChange={(e) => updateVisibility('city', e.target.value as any)}
                  className="mt-2 px-2 py-1 text-xs border border-gray-300 rounded-md"
                >
                  {VISIBILITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={data.country || ''}
                  onChange={(e) => updateData({ country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="India"
                />
                <select
                  value={visibility.country || 'public'}
                  onChange={(e) => updateVisibility('country', e.target.value as any)}
                  className="mt-2 px-2 py-1 text-xs border border-gray-300 rounded-md"
                >
                  {VISIBILITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
              Contact
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={data.email || ''}
                  onChange={(e) => updateData({ email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="your@email.com"
                />
                <select
                  value={visibility.email || 'private'}
                  onChange={(e) => updateVisibility('email', e.target.value as any)}
                  className="mt-2 px-2 py-1 text-xs border border-gray-300 rounded-md"
                >
                  {VISIBILITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={data.phone || ''}
                  onChange={(e) => updateData({ phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="+91 9876543210"
                />
                <select
                  value={visibility.phone || 'private'}
                  onChange={(e) => updateVisibility('phone', e.target.value as any)}
                  className="mt-2 px-2 py-1 text-xs border border-gray-300 rounded-md"
                >
                  {VISIBILITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Gender/Identity Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
              Gender & Identity
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender identity
                </label>
                <select
                  value={data.gender_identity || ''}
                  onChange={(e) => updateData({ gender_identity: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="man">Man</option>
                  <option value="woman">Woman</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                <select
                  value={visibility.gender_identity || 'private'}
                  onChange={(e) => updateVisibility('gender_identity', e.target.value as any)}
                  className="mt-2 px-2 py-1 text-xs border border-gray-300 rounded-md"
                >
                  {VISIBILITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pronouns
                </label>
                <input
                  type="text"
                  value={data.pronouns || ''}
                  onChange={(e) => updateData({ pronouns: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="he/him, she/her, they/them, etc."
                />
                <select
                  value={visibility.pronouns || 'public'}
                  onChange={(e) => updateVisibility('pronouns', e.target.value as any)}
                  className="mt-2 px-2 py-1 text-xs border border-gray-300 rounded-md"
                >
                  {VISIBILITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <div>
                {hasUnsavedChanges && (
                  <p className="text-sm text-orange-600">You have unsaved changes</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className={`
                  px-6 py-3 rounded-full text-white font-medium transition-colors
                  ${saving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-black hover:bg-gray-800'
                  }
                `}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
