'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { NetWorthData, NetWorthVisibility } from '@/types/forms'

const NET_WORTH_BANDS = [
  '< $10k',
  '$10k–20k', 
  '$20k–50k',
  '$50k–100k',
  '$100k–250k',
  '$250k–500k',
  '$500k+'
]

export default function NetWorthForm() {
  console.log('🔍 NetWorthForm: Component rendering')
  
  const [data, setData] = useState<NetWorthData>({
    assets: {},
    liabilities: {},
    sharing: { mode: 'band' }
  })
  const [visibility, setVisibility] = useState<NetWorthVisibility>({
    networth_band: 'public'
  })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  console.log('🔍 NetWorthForm: State values:', {
    data: data,
    visibility: visibility,
    saving: saving,
    saveSuccess: saveSuccess,
    isClient: typeof window !== 'undefined'
  })

  useEffect(() => {
    console.log('🔍 NetWorthForm: useEffect triggered')
    
    // Load data in background without blocking UI
    fetch('/api/forms/networth')
      .then(res => {
        console.log('🔍 NetWorthForm: API response received:', res.status)
        return res.json()
      })
      .then(result => {
        console.log('🔍 NetWorthForm: API result:', result)
        if (result.success) {
          if (result.data.data) {
            console.log('🔍 NetWorthForm: Setting data:', result.data.data)
            setData(result.data.data)
          }
          if (result.data.visibility) {
            console.log('🔍 NetWorthForm: Setting visibility:', result.data.visibility)
            setVisibility(result.data.visibility)
          }
        }
      })
      .catch(error => {
        console.error('🔍 NetWorthForm: Failed to load:', error)
      })
  }, [])

  async function saveData() {
    try {
      setSaving(true)
      
      const totalAssets = Object.values(data.assets || {}).reduce((sum, val) => sum + (val || 0), 0)
      const totalLiabilities = Object.values(data.liabilities || {}).reduce((sum, val) => sum + (val || 0), 0)
      const networth_computed = totalAssets - totalLiabilities
      
      const payload = {
        data: { ...data, networth_computed },
        visibility
      }

      const response = await fetch('/api/forms/networth', {
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

  function updateAsset(key: string, value: number | undefined) {
    setData(prev => ({
      ...prev,
      assets: { ...prev.assets, [key]: value }
    }))
  }

  function updateLiability(key: string, value: number | undefined) {
    setData(prev => ({
      ...prev,
      liabilities: { ...prev.liabilities, [key]: value }
    }))
  }

  function updateSharing(updates: Partial<NetWorthData['sharing']>) {
    setData(prev => ({
      ...prev,
      sharing: { 
        mode: prev.sharing?.mode || 'band',
        ...updates 
      }
    }))
  }

  // RENDER FORM IMMEDIATELY - NO LOADING STATE
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
          <h1 className="text-3xl font-bold text-black mb-4">Net Worth Form</h1>
          <p className="text-gray-600">A private snapshot of what you own and owe.</p>
        </div>

        {/* Intro */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
          <p className="text-sm text-blue-800">
            We use this to calculate a high-level band of your net worth. You control how much, if anything, appears on your public card.
          </p>
        </div>

        {/* Assets Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Assets</h2>
          <p className="text-sm text-gray-600 mb-6">
            Approximate values are fine. You can leave fields blank if they don't apply.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash & bank
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.assets?.cash_and_bank || ''}
                  onChange={(e) => updateAsset('cash_and_bank', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Savings + current accounts</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investments – brokerage
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.assets?.investments_brokerage || ''}
                  onChange={(e) => updateAsset('investments_brokerage', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Stocks, mutual funds, ETFs</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retirement accounts
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.assets?.retirement_accounts || ''}
                  onChange={(e) => updateAsset('retirement_accounts', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">401k, PF, pension, etc.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Real estate equity
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.assets?.real_estate_equity || ''}
                  onChange={(e) => updateAsset('real_estate_equity', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Property value minus home loans</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicles equity
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.assets?.vehicles_equity || ''}
                  onChange={(e) => updateAsset('vehicles_equity', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Car/bike value minus loans</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other assets
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.assets?.other_assets || ''}
                  onChange={(e) => updateAsset('other_assets', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Jewellery, collectibles, crypto, etc.</p>
            </div>
          </div>
        </div>

        {/* Liabilities Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Liabilities</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mortgage balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.liabilities?.mortgage_balance || ''}
                  onChange={(e) => updateLiability('mortgage_balance', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Housing loans</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student / education loans
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.liabilities?.education_loans || ''}
                  onChange={(e) => updateLiability('education_loans', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit cards & personal loans
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.liabilities?.credit_cards_personal_loans || ''}
                  onChange={(e) => updateLiability('credit_cards_personal_loans', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Revolving + personal loans</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other liabilities
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.liabilities?.other_liabilities || ''}
                  onChange={(e) => updateLiability('other_liabilities', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Taxes due, other debts</p>
            </div>
          </div>
        </div>

        {/* Sharing Preferences */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Sharing preferences</h2>
          <p className="text-sm text-gray-600 mb-6">
            This controls what, if anything, appears on your public profile. We never show exact numbers publicly.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How should we show your net worth?
              </label>
              <div className="space-y-3">
                <div>
                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="sharing_mode"
                      value="hide"
                      checked={data.sharing?.mode === 'hide'}
                      onChange={(e) => updateSharing({ mode: e.target.value as any })}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className="text-sm font-medium">Hide completely</span>
                      <p className="text-xs text-gray-500">Net worth will not appear on your public legacy profile.</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="sharing_mode"
                      value="band"
                      checked={data.sharing?.mode === 'band'}
                      onChange={(e) => updateSharing({ mode: e.target.value as any })}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className="text-sm font-medium">Show band only (recommended)</span>
                      <p className="text-xs text-gray-500">We'll show something like "$10k–20k" instead of exact numbers.</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="sharing_mode"
                      value="range"
                      checked={data.sharing?.mode === 'range'}
                      onChange={(e) => updateSharing({ mode: e.target.value as any })}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className="text-sm font-medium">Show custom range</span>
                      <p className="text-xs text-gray-500">You decide an approximate range to display.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {data.sharing?.mode === 'band' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Net worth band
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={data.sharing?.selected_band || ''}
                  onChange={(e) => updateSharing({ selected_band: e.target.value })}
                >
                  <option value="">Select a band</option>
                  {NET_WORTH_BANDS.map(band => (
                    <option key={band} value={band}>{band}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility for band
              </label>
              <div className="flex rounded-md border border-gray-300">
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border-r transition-colors ${
                    visibility.networth_band === 'public' 
                      ? 'bg-black text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setVisibility(prev => ({ ...prev, networth_band: 'public' }))}
                >
                  Public
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md transition-colors ${
                    visibility.networth_band === 'private' 
                      ? 'bg-black text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setVisibility(prev => ({ ...prev, networth_band: 'private' }))}
                >
                  Private
                </button>
              </div>
            </div>
          </div>

          {/* Warning for band mode without selection */}
          {data.sharing?.mode === 'band' && !data.sharing?.selected_band && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Select a band or choose 'Hide completely'.
              </p>
            </div>
          )}
        </div>

        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-md">
            Saved · Your net worth band will follow your sharing settings.
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
            {saving ? 'Saving...' : 'Save net worth'}
          </button>
        </div>
      </div>

      {/* Bottom spacing for fixed save bar */}
      <div className="h-20"></div>
    </div>
  )
}
