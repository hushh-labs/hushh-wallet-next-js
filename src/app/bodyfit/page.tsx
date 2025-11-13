'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BodyFitData, BodyFitVisibility } from '@/types/forms'

const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const SHOE_WIDTHS = ['narrow', 'regular', 'wide']
const SHOE_SYSTEMS = ['EU', 'US', 'UK', 'CM']
const FIT_PREFERENCES = ['slim', 'regular', 'relaxed']

export default function BodyFitForm() {
  const [data, setData] = useState<BodyFitData>({
    height: { value: 0, unit: 'cm' },
    weight: { value: 0, unit: 'kg', provided: false },
    fit_preference: 'regular',
    shoe: { size: 0, system: 'EU' },
    qr_visibility: {
      show_top_size: true,
      show_shoe_size: true,
      show_detailed_measurements: false,
      show_fit_preference: true
    }
  })
  const [visibility, setVisibility] = useState<BodyFitVisibility>({
    top_size: 'public',
    shoe: 'public',
    measurements: 'trusted',
    body_notes: 'private'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const response = await fetch('/api/forms/bodyfit')
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
      console.error('Failed to load body fit data:', error)
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

      const response = await fetch('/api/forms/bodyfit', {
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

  function updateHeight(updates: Partial<BodyFitData['height']>) {
    setData(prev => ({
      ...prev,
      height: { 
        value: prev.height?.value || 0,
        unit: prev.height?.unit || 'cm',
        ...updates 
      }
    }))
  }

  function updateWeight(updates: Partial<BodyFitData['weight']>) {
    setData(prev => ({
      ...prev,
      weight: { 
        value: prev.weight?.value || 0,
        unit: prev.weight?.unit || 'kg',
        provided: prev.weight?.provided || false,
        ...updates 
      }
    }))
  }

  function updateShoe(updates: Partial<BodyFitData['shoe']>) {
    setData(prev => ({
      ...prev,
      shoe: { 
        size: prev.shoe?.size || 0,
        system: prev.shoe?.system || 'EU',
        ...updates 
      }
    }))
  }

  function updateQRVisibility(updates: Partial<BodyFitData['qr_visibility']>) {
    setData(prev => ({
      ...prev,
      qr_visibility: { ...prev.qr_visibility, ...updates }
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your body fit form...</p>
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
          <h1 className="text-3xl font-bold text-black mb-4">Body & Fit Form</h1>
          <p className="text-gray-600">Your sizes and fit preferences.</p>
        </div>

        {/* Core Measurements */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Core measurements</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="170"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.height?.value || ''}
                  onChange={(e) => updateHeight({ value: Number(e.target.value) })}
                />
                <div className="flex rounded-md border border-gray-300">
                  <button
                    type="button"
                    className={`py-2 px-3 text-sm rounded-l-md border-r transition-colors ${
                      data.height?.unit === 'cm' 
                        ? 'bg-black text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => updateHeight({ unit: 'cm' })}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 text-sm rounded-r-md transition-colors ${
                      data.height?.unit === 'ft_in' 
                        ? 'bg-black text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => updateHeight({ unit: 'ft_in' })}
                  >
                    ft/in
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="70"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.weight?.provided ? data.weight.value : ''}
                  onChange={(e) => updateWeight({ 
                    value: Number(e.target.value),
                    provided: !!e.target.value
                  })}
                />
                <div className="flex rounded-md border border-gray-300">
                  <button
                    type="button"
                    className={`py-2 px-3 text-sm rounded-l-md border-r transition-colors ${
                      data.weight?.unit === 'kg' 
                        ? 'bg-black text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => updateWeight({ unit: 'kg' })}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 text-sm rounded-r-md transition-colors ${
                      data.weight?.unit === 'lbs' 
                        ? 'bg-black text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => updateWeight({ unit: 'lbs' })}
                  >
                    lbs
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">You can skip weight if you're not comfortable sharing it.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fit preference
              </label>
              <div className="flex rounded-md border border-gray-300">
                {FIT_PREFERENCES.map(pref => (
                  <button
                    key={pref}
                    type="button"
                    className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                      data.fit_preference === pref 
                        ? 'bg-black text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } ${pref === 'slim' ? 'rounded-l-md' : pref === 'relaxed' ? 'rounded-r-md' : ''} ${pref !== 'relaxed' ? 'border-r' : ''}`}
                    onClick={() => setData(prev => ({ ...prev, fit_preference: pref as any }))}
                  >
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Clothing & Shoes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Clothing & shoes</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Top size
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                value={data.top_size || ''}
                onChange={(e) => setData(prev => ({ ...prev, top_size: e.target.value }))}
              >
                <option value="">Select size</option>
                {TOP_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chest
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="96"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.chest || ''}
                  onChange={(e) => setData(prev => ({ ...prev, chest: Number(e.target.value) }))}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waist
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="32"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.waist || ''}
                  onChange={(e) => setData(prev => ({ ...prev, waist: Number(e.target.value) }))}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inseam
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="32"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.inseam || ''}
                  onChange={(e) => setData(prev => ({ ...prev, inseam: Number(e.target.value) }))}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">cm</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shoe size
                </label>
                <input
                  type="number"
                  placeholder="42"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.shoe?.size || ''}
                  onChange={(e) => updateShoe({ size: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.shoe?.width || 'regular'}
                  onChange={(e) => updateShoe({ width: e.target.value as any })}
                >
                  {SHOE_WIDTHS.map(width => (
                    <option key={width} value={width}>
                      {width.charAt(0).toUpperCase() + width.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.shoe?.system || 'EU'}
                  onChange={(e) => updateShoe({ system: e.target.value as any })}
                >
                  {SHOE_SYSTEMS.map(system => (
                    <option key={system} value={system}>{system}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            These details help with better size recommendations. Approximations are fine.
          </p>
        </div>

        {/* Accessories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Accessories</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ring size
              </label>
              <input
                type="text"
                placeholder="7"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                value={data.ring_size || ''}
                onChange={(e) => setData(prev => ({ ...prev, ring_size: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wrist circumference
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="17"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.wrist_circumference || ''}
                  onChange={(e) => setData(prev => ({ ...prev, wrist_circumference: Number(e.target.value) }))}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">cm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Notes */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Body notes
          </label>
          <textarea
            rows={3}
            placeholder="Anything tailors or stylists should know? (e.g. 'broad shoulders, shorter torso')"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            value={data.body_notes || ''}
            onChange={(e) => setData(prev => ({ ...prev, body_notes: e.target.value }))}
          />
        </div>

        {/* QR Visibility Controls */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">What should appear if someone scans your QR?</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_top_size"
                checked={data.qr_visibility?.show_top_size || false}
                onChange={(e) => updateQRVisibility({ show_top_size: e.target.checked })}
                className="mr-3"
              />
              <label htmlFor="show_top_size" className="text-sm text-gray-700">
                Show top size
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_shoe_size"
                checked={data.qr_visibility?.show_shoe_size || false}
                onChange={(e) => updateQRVisibility({ show_shoe_size: e.target.checked })}
                className="mr-3"
              />
              <label htmlFor="show_shoe_size" className="text-sm text-gray-700">
                Show shoe size
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_detailed_measurements"
                checked={data.qr_visibility?.show_detailed_measurements || false}
                onChange={(e) => updateQRVisibility({ show_detailed_measurements: e.target.checked })}
                className="mr-3"
              />
              <label htmlFor="show_detailed_measurements" className="text-sm text-gray-700">
                Show detailed measurements
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_fit_preference"
                checked={data.qr_visibility?.show_fit_preference || false}
                onChange={(e) => updateQRVisibility({ show_fit_preference: e.target.checked })}
                className="mr-3"
              />
              <label htmlFor="show_fit_preference" className="text-sm text-gray-700">
                Show fit preference
              </label>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-md">
            Saved · Your fit profile will update on your legacy card.
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
            {saving ? 'Saving...' : 'Save fit profile'}
          </button>
        </div>
      </div>

      {/* Bottom spacing for fixed save bar */}
      <div className="h-20"></div>
    </div>
  )
}
