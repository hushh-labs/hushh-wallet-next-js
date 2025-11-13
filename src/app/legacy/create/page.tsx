'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
// Removed server-side imports to fix Next.js App Router build issues
import { LegacyCreateData, LegacyCardPayload, LegacyDimension } from '@/types/legacy'

export default function CreateLegacyCard() {
  const [data, setData] = useState<LegacyCreateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dimensions, setDimensions] = useState<LegacyDimension[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const response = await fetch('/api/legacy/create')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      setData(result.data)
      setDimensions(result.data.dimensions)
    } catch (err) {
      console.error('Error loading legacy create data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleToggle(dimensionKey: string, value: boolean) {
    setDimensions(prev => 
      prev.map(dim => 
        dim.key === dimensionKey ? { ...dim, include: value } : dim
      )
    )
  }

  async function handleGenerate() {
    if (!data) return

    try {
      setSubmitting(true)
      setError(null)

      // Build payload
      const payload: LegacyCardPayload = {
        include_identity: dimensions.find(d => d.key === 'identity')?.include || false,
        include_networth: dimensions.find(d => d.key === 'networth')?.include || false,
        include_bodyfit: dimensions.find(d => d.key === 'bodyfit')?.include || false,
        include_food: dimensions.find(d => d.key === 'food')?.include || false,
        include_lifestyle: dimensions.find(d => d.key === 'lifestyle')?.include || false,
      }

      // Client-side validation
      const hasValidIncludes = dimensions.some(dim => 
        dim.hasData && payload[`include_${dim.key}` as keyof LegacyCardPayload]
      )
      
      if (!hasValidIncludes) {
        setError('Please include at least one section before generating your card.')
        return
      }

      // Create/update card via API
      const response = await fetch('/api/legacy/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // Redirect to card view
      window.location.href = '/legacy/card'

    } catch (err) {
      console.error('Error generating legacy card:', err)
      setError('We couldn\'t generate your card right now. Please try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load data</p>
          <button onClick={loadData} className="px-4 py-2 bg-black text-white rounded-md">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Generate preview
  const preview = dimensions
    .filter(dim => dim.include && dim.hasData)
    .map(dim => {
      const previewText = data.textualPreview.find(p => p.includes(dim.key))
      return previewText || `${dim.title} data included`
    })

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
          <h1 className="text-3xl font-bold text-black mb-4">
            Create your Hushh Legacy Signature Card
          </h1>
          <p className="text-gray-600 mb-4">
            Choose which parts of your profile should appear on your legacy card and public QR.
          </p>
          <p className="text-sm text-gray-500">
            We never show anything you haven't saved. You can update this anytime.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Section 1: Dimensions List */}
        <div className="space-y-4 mb-8">
          {dimensions.map((dimension) => (
            <div 
              key={dimension.key}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-black">
                      {dimension.title}
                    </h3>
                    {!dimension.hasData && (
                      <Link 
                        href={dimension.route}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Fill form
                      </Link>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {dimension.subtext}
                  </p>
                  {!dimension.hasData && (
                    <p className="text-gray-400 text-xs">
                      No data yet · Fill the form first
                    </p>
                  )}
                </div>
                
                <div className="ml-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dimension.include}
                      onChange={(e) => handleToggle(dimension.key, e.target.checked)}
                      disabled={!dimension.hasData}
                      className="sr-only"
                    />
                    <div className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${dimension.hasData 
                        ? (dimension.include ? 'bg-black' : 'bg-gray-200')
                        : 'bg-gray-100 cursor-not-allowed'
                      }
                    `}>
                      <span className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${dimension.include ? 'translate-x-6' : 'translate-x-1'}
                      `} />
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {dimension.hasData ? 'Include' : 'Fill form'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Textual Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-black mb-3">Quick preview</h3>
          <p className="text-gray-600 text-sm mb-4">
            Here's a rough idea of what someone might see when they scan your card:
          </p>
          
          {preview.length > 0 ? (
            <div className="space-y-2">
              {preview.map((item, index) => (
                <p key={index} className="text-sm font-medium text-gray-900 bg-white px-3 py-2 rounded-md">
                  {item}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">
              Include at least one section to see a preview
            </p>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="text-center space-y-4">
          <button
            onClick={handleGenerate}
            disabled={submitting}
            className={`
              w-full py-3 px-6 rounded-full text-lg font-medium transition-colors
              ${submitting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800'
              }
            `}
          >
            {submitting ? 'Generating...' : 'Generate legacy card'}
          </button>
          
          <Link 
            href="/dashboard"
            className="block text-gray-600 hover:text-black transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
