'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LifestyleData, LifestyleVisibility } from '@/types/forms'

export default function LifestyleForm() {
  const [data, setData] = useState<LifestyleData>({
    drinking: {
      status: 'no',
      frequency: '',
      typical_quantity: '',
      preferred_drinks: [],
      typical_budget_per_drink: undefined
    },
    smoking: {
      status: 'no',
      type: '',
      quantity: '',
      quit_year: undefined
    },
    sharing: {
      mode: 'high_level'
    }
  })
  const [visibility, setVisibility] = useState<LifestyleVisibility>({
    drinking_high_level: 'public',
    smoking_high_level: 'public',
    detailed_drinking: 'private',
    detailed_smoking: 'private'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const response = await fetch('/api/forms/lifestyle')
      const result = await response.json()
      
      if (result.success) {
        if (result.data.data) {
          setData(result.data.data)
        }
        if (result.data.visibility) {
          setVisibility(result.data.visibility)
        }
      }
    } catch (error) {
      console.error('Failed to load lifestyle data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveData() {
    try {
      setSaving(true)
      
      const payload = {
        data,
        visibility
      }

      const response = await fetch('/api/forms/lifestyle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      
      if (result.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        throw new Error(result.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function updateDrinking(updates: Partial<LifestyleData['drinking']>) {
    setData(prev => ({
      ...prev,
      drinking: { 
        status: prev.drinking?.status || 'no',
        frequency: prev.drinking?.frequency || '',
        typical_quantity: prev.drinking?.typical_quantity || '',
        preferred_drinks: prev.drinking?.preferred_drinks || [],
        typical_budget_per_drink: prev.drinking?.typical_budget_per_drink,
        ...updates 
      }
    }))
  }

  function updateSmoking(updates: Partial<LifestyleData['smoking']>) {
    setData(prev => ({
      ...prev,
      smoking: { 
        status: prev.smoking?.status || 'no',
        type: prev.smoking?.type || '',
        quantity: prev.smoking?.quantity || '',
        quit_year: prev.smoking?.quit_year,
        ...updates 
      }
    }))
  }

  function togglePreferredDrink(drink: string) {
    const current = data.drinking?.preferred_drinks || []
    if (current.includes(drink)) {
      updateDrinking({
        preferred_drinks: current.filter(d => d !== drink)
      })
    } else {
      updateDrinking({
        preferred_drinks: [...current, drink]
      })
    }
  }

  // Auto-set sharing mode to hide if prefer_not_to_say
  useEffect(() => {
    if (data.drinking?.status === 'prefer_not_to_say') {
      setData(prev => ({
        ...prev,
        sharing: { 
          mode: 'hide'
        }
      }))
    }
  }, [data.drinking?.status])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your lifestyle preferences...</p>
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
            <Link href="/dashboard" className="text-xl font-medium text-black">← hushh</Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-black transition-colors">What is this?</Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">Lifestyle Form</h1>
          <p className="text-gray-600">High-level habits around drinking and smoking.</p>
        </div>

        {/* Intro */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
          <p className="text-sm text-blue-800">
            Optional. Share as much or as little as you're comfortable with.
          </p>
        </div>

        {/* Drinking Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Drinking</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you drink?
              </label>
              <div className="flex flex-col space-y-2">
                {[
                  { value: 'no', label: 'No' },
                  { value: 'occasionally', label: 'Occasionally' },
                  { value: 'often', label: 'Often' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="drinking_status"
                      value={option.value}
                      checked={data.drinking?.status === option.value}
                      onChange={(e) => updateDrinking({ status: e.target.value as any })}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {data.drinking?.status !== 'no' && data.drinking?.status !== 'prefer_not_to_say' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How often?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Weekends only, 2-3 times per week..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    value={data.drinking?.frequency || ''}
                    onChange={(e) => updateDrinking({ frequency: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typical quantity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1-2 glasses, Moderate, Social drinking..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    value={data.drinking?.typical_quantity || ''}
                    onChange={(e) => updateDrinking({ typical_quantity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred drinks
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Wine', 'Beer', 'Cocktails', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Other spirits'].map(drink => (
                      <div key={drink} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={data.drinking?.preferred_drinks?.includes(drink) || false}
                          onChange={() => togglePreferredDrink(drink)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{drink}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typical budget per drink
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      placeholder="15"
                      className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      value={data.drinking?.typical_budget_per_drink || ''}
                      onChange={(e) => updateDrinking({ typical_budget_per_drink: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Smoking Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Smoking</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you smoke?
              </label>
              <div className="flex flex-col space-y-2">
                {[
                  { value: 'no', label: 'No' },
                  { value: 'occasionally', label: 'Occasionally' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'former', label: 'Former smoker' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="smoking_status"
                      value={option.value}
                      checked={data.smoking?.status === option.value}
                      onChange={(e) => updateSmoking({ status: e.target.value as any })}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {(data.smoking?.status === 'occasionally' || data.smoking?.status === 'daily') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cigarettes, Cigars, Pipe..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    value={data.smoking?.type || ''}
                    onChange={(e) => updateSmoking({ type: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5 per day, Pack per week..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    value={data.smoking?.quantity || ''}
                    onChange={(e) => updateSmoking({ quantity: e.target.value })}
                  />
                </div>
              </>
            )}

            {data.smoking?.status === 'former' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quit year
                </label>
                <input
                  type="number"
                  placeholder="2020"
                  min="1950"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.smoking?.quit_year || ''}
                  onChange={(e) => updateSmoking({ quit_year: Number(e.target.value) })}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sharing Level */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Sharing level</h2>
          <p className="text-sm text-gray-600 mb-6">
            This controls how much of this shows up when someone scans your QR.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Public sharing level
              </label>
              <div className="space-y-3">
                <div>
                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="sharing_mode"
                      value="hide"
                      checked={data.sharing.mode === 'hide'}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        sharing: { mode: e.target.value as any }
                      }))}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className="text-sm font-medium">Hide completely</span>
                      <p className="text-xs text-gray-500">Nothing from Lifestyle appears publicly.</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="sharing_mode"
                      value="high_level"
                      checked={data.sharing.mode === 'high_level'}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        sharing: { mode: e.target.value as any }
                      }))}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className="text-sm font-medium">Show only high-level labels</span>
                      <p className="text-xs text-gray-500">E.g. "Drinks occasionally", "Non-smoker".</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {data.sharing.mode === 'high_level' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drinking (high-level visibility)
                  </label>
                  <div className="flex rounded-md border border-gray-300">
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border-r transition-colors ${
                        visibility.drinking_high_level === 'public' 
                          ? 'bg-black text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setVisibility(prev => ({ ...prev, drinking_high_level: 'public' }))}
                    >
                      Public
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md transition-colors ${
                        visibility.drinking_high_level === 'private' 
                          ? 'bg-black text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setVisibility(prev => ({ ...prev, drinking_high_level: 'private' }))}
                    >
                      Private
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Smoking (high-level visibility)
                  </label>
                  <div className="flex rounded-md border border-gray-300">
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border-r transition-colors ${
                        visibility.smoking_high_level === 'public' 
                          ? 'bg-black text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setVisibility(prev => ({ ...prev, smoking_high_level: 'public' }))}
                    >
                      Public
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md transition-colors ${
                        visibility.smoking_high_level === 'private' 
                          ? 'bg-black text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setVisibility(prev => ({ ...prev, smoking_high_level: 'private' }))}
                    >
                      Private
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-md">
            Saved · Your lifestyle section will follow your sharing level.
          </div>
        )}
      </div>

      {/* Fixed Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={saveData}
            disabled={saving}
            className="w-full bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save lifestyle preferences'}
          </button>
        </div>
      </div>

      {/* Bottom spacing for fixed save bar */}
      <div className="h-20"></div>
    </div>
  )
}
