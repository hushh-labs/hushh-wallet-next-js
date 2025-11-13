'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FoodData, FoodVisibility, FoodAllergy } from '@/types/forms'

const DIET_TYPES = [
  'Omnivore', 
  'Vegetarian', 
  'Vegan', 
  'Pescatarian', 
  'Keto', 
  'Paleo', 
  'Mediterranean',
  'Gluten-free',
  'Other'
]

const BIG_NINE_ALLERGENS = [
  'Peanuts', 
  'Tree nuts', 
  'Milk', 
  'Eggs', 
  'Fish', 
  'Shellfish', 
  'Wheat', 
  'Soy', 
  'Sesame'
]

const COMMON_INTOLERANCES = [
  'Lactose',
  'Gluten', 
  'Fructose',
  'Histamine',
  'Caffeine',
  'Artificial sweeteners',
  'MSG'
]

const BEVERAGE_OPTIONS = [
  'Water',
  'Coffee', 
  'Tea', 
  'Juice', 
  'Soda', 
  'Energy drinks',
  'Kombucha',
  'Smoothies'
]

export default function FoodForm() {
  const [data, setData] = useState<FoodData>({
    diet_type: '',
    spice_tolerance: 'medium',
    sweet_preference: 5,
    salt_preference: 5,
    allergies: [],
    intolerances: [],
    cuisines_like: [],
    cuisines_avoid: [],
    go_to_dishes: '',
    meal_pattern: '',
    non_alcoholic_beverages: [],
    qr_visibility: {
      enabled: true,
      show_diet_type: true,
      show_allergies: true,
      show_cuisine_likes: true,
      show_intolerances: false
    }
  })
  const [visibility, setVisibility] = useState<FoodVisibility>({
    diet_type: 'public',
    allergies: 'public',
    intolerances: 'trusted',
    cuisines_like: 'public',
    cuisines_avoid: 'public',
    go_to_dishes: 'public'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const response = await fetch('/api/forms/food')
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
      console.error('Failed to load food data:', error)
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

      const response = await fetch('/api/forms/food', {
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

  function toggleAllergy(allergen: string) {
    setData(prev => {
      const existing = prev.allergies?.find(a => a.name === allergen)
      if (existing) {
        return {
          ...prev,
          allergies: prev.allergies?.filter(a => a.name !== allergen)
        }
      } else {
        return {
          ...prev,
          allergies: [...(prev.allergies || []), { name: allergen, severity: 'moderate' }]
        }
      }
    })
  }

  function updateAllergySeverity(allergen: string, severity: 'mild' | 'moderate' | 'severe') {
    setData(prev => ({
      ...prev,
      allergies: prev.allergies?.map(a => 
        a.name === allergen ? { ...a, severity } : a
      )
    }))
  }

  function toggleIntolerance(item: string) {
    setData(prev => {
      const current = prev.intolerances || []
      if (current.includes(item)) {
        return {
          ...prev,
          intolerances: current.filter(i => i !== item)
        }
      } else {
        return {
          ...prev,
          intolerances: [...current, item]
        }
      }
    })
  }

  function toggleBeverage(item: string) {
    setData(prev => {
      const current = prev.non_alcoholic_beverages || []
      if (current.includes(item)) {
        return {
          ...prev,
          non_alcoholic_beverages: current.filter(b => b !== item)
        }
      } else {
        return {
          ...prev,
          non_alcoholic_beverages: [...current, item]
        }
      }
    })
  }

  function updateQRVisibility(updates: Partial<FoodData['qr_visibility']>) {
    setData(prev => ({
      ...prev,
      qr_visibility: { 
        enabled: prev.qr_visibility?.enabled || false,
        show_diet_type: prev.qr_visibility?.show_diet_type,
        show_allergies: prev.qr_visibility?.show_allergies,
        show_cuisine_likes: prev.qr_visibility?.show_cuisine_likes,
        show_intolerances: prev.qr_visibility?.show_intolerances,
        ...updates 
      }
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your food preferences...</p>
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
          <h1 className="text-3xl font-bold text-black mb-4">Food Preferences Form</h1>
          <p className="text-gray-600">What you eat, love and avoid.</p>
        </div>

        {/* Diet Basics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Diet basics</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diet type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                value={data.diet_type || ''}
                onChange={(e) => setData(prev => ({ ...prev, diet_type: e.target.value }))}
              >
                <option value="">Select diet type</option>
                {DIET_TYPES.map(diet => (
                  <option key={diet} value={diet}>{diet}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spice tolerance
              </label>
              <div className="flex rounded-md border border-gray-300">
                {(['low', 'medium', 'high'] as const).map(level => (
                  <button
                    key={level}
                    type="button"
                    className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                      data.spice_tolerance === level 
                        ? 'bg-black text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } ${level === 'low' ? 'rounded-l-md' : level === 'high' ? 'rounded-r-md' : ''} ${level !== 'high' ? 'border-r' : ''}`}
                    onClick={() => setData(prev => ({ ...prev, spice_tolerance: level }))}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sweet preference
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">0</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={data.sweet_preference || 5}
                  onChange={(e) => setData(prev => ({ ...prev, sweet_preference: Number(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500">10</span>
                <span className="w-8 text-sm text-gray-700">{data.sweet_preference}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">0 = very low, 10 = very high</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salt preference
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">0</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={data.salt_preference || 5}
                  onChange={(e) => setData(prev => ({ ...prev, salt_preference: Number(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500">10</span>
                <span className="w-8 text-sm text-gray-700">{data.salt_preference}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">0 = very low, 10 = very high</p>
            </div>
          </div>
        </div>

        {/* Allergies & Intolerances */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Allergies & intolerances</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Allergies (Big-9)</h3>
              <p className="text-xs text-gray-500 mb-4">We highlight these as "must avoid" if you allow them on your QR.</p>
              
              <div className="space-y-3">
                {BIG_NINE_ALLERGENS.map(allergen => {
                  const isSelected = data.allergies?.some(a => a.name === allergen)
                  const allergy = data.allergies?.find(a => a.name === allergen)
                  
                  return (
                    <div key={allergen} className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAllergy(allergen)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 min-w-[80px]">{allergen}</span>
                      </div>
                      
                      {isSelected && (
                        <select
                          value={allergy?.severity || 'moderate'}
                          onChange={(e) => updateAllergySeverity(allergen, e.target.value as any)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded"
                        >
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                        </select>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intolerances / sensitivities
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_INTOLERANCES.map(item => (
                  <div key={item} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.intolerances?.includes(item) || false}
                      onChange={() => toggleIntolerance(item)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Likes & Avoids */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Likes & avoids</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favourite cuisines
              </label>
              <input
                type="text"
                placeholder="e.g. Indian, Italian, Mexican..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                value={data.cuisines_like?.join(', ') || ''}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  cuisines_like: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisines to avoid
              </label>
              <input
                type="text"
                placeholder="e.g. Very spicy, Raw fish..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                value={data.cuisines_avoid?.join(', ') || ''}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  cuisines_avoid: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Go-to dishes
              </label>
              <textarea
                rows={3}
                placeholder="What are your comfort foods or dishes you always order?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                value={data.go_to_dishes || ''}
                onChange={(e) => setData(prev => ({ ...prev, go_to_dishes: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Patterns & Beverages */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Patterns & beverages</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typical meal pattern
              </label>
              <input
                type="text"
                placeholder="e.g. 3 meals + snacks, Intermittent fasting, 5 small meals..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                value={data.meal_pattern || ''}
                onChange={(e) => setData(prev => ({ ...prev, meal_pattern: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Non-alcoholic beverages you prefer
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BEVERAGE_OPTIONS.map(beverage => (
                  <div key={beverage} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.non_alcoholic_beverages?.includes(beverage) || false}
                      onChange={() => toggleBeverage(beverage)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{beverage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* QR Sharing Controls */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">When someone scans your QR at a food place…</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="qr_enabled"
                checked={data.qr_visibility?.enabled || false}
                onChange={(e) => updateQRVisibility({ enabled: e.target.checked })}
                className="mr-3"
              />
              <label htmlFor="qr_enabled" className="text-sm font-medium text-gray-700">
                Show food preferences in QR
              </label>
            </div>

            {data.qr_visibility?.enabled && (
              <>
                <div className="flex items-center pl-6">
                  <input
                    type="checkbox"
                    id="show_diet_type"
                    checked={data.qr_visibility?.show_diet_type || false}
                    onChange={(e) => updateQRVisibility({ show_diet_type: e.target.checked })}
                    className="mr-3"
                  />
                  <label htmlFor="show_diet_type" className="text-sm text-gray-700">
                    Show diet type
                  </label>
                </div>

                <div className="flex items-center pl-6">
                  <input
                    type="checkbox"
                    id="show_allergies"
                    checked={data.qr_visibility?.show_allergies || false}
                    onChange={(e) => updateQRVisibility({ show_allergies: e.target.checked })}
                    className="mr-3"
                  />
                  <label htmlFor="show_allergies" className="text-sm text-gray-700">
                    Show allergies
                  </label>
                </div>

                <div className="flex items-center pl-6">
                  <input
                    type="checkbox"
                    id="show_cuisine_likes"
                    checked={data.qr_visibility?.show_cuisine_likes || false}
                    onChange={(e) => updateQRVisibility({ show_cuisine_likes: e.target.checked })}
                    className="mr-3"
                  />
                  <label htmlFor="show_cuisine_likes" className="text-sm text-gray-700">
                    Show favourite cuisines
                  </label>
                </div>

                <div className="flex items-center pl-6">
                  <input
                    type="checkbox"
                    id="show_intolerances"
                    checked={data.qr_visibility?.show_intolerances || false}
                    onChange={(e) => updateQRVisibility({ show_intolerances: e.target.checked })}
                    className="mr-3"
                  />
                  <label htmlFor="show_intolerances" className="text-sm text-gray-700">
                    Show intolerances
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              Diet type and allergies are most useful on your public card.
            </p>
          </div>
        </div>

        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-md">
            Saved · Your food profile will reflect your latest preferences.
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
            {saving ? 'Saving...' : 'Save food preferences'}
          </button>
        </div>
      </div>

      {/* Bottom spacing for fixed save bar */}
      <div className="h-20"></div>
    </div>
  )
}
