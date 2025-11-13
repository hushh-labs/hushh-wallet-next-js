'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { DashboardData, FormStatus } from '@/types/dashboard'

// Moved client-side utility functions here to avoid server imports
function getStatusPillStyle(status: FormStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800'
    case 'not_started':
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusText(status: FormStatus): string {
  switch (status) {
    case 'completed':
      return 'Complete'
    case 'in_progress':
      return 'In progress'
    case 'not_started':
    default:
      return 'Not started'
  }
}

function getCTAButtonStyle(enabled: boolean): string {
  return enabled
    ? 'bg-black text-white hover:bg-gray-800'
    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
}

function getCTAHelperText(enabled: boolean): string {
  return enabled
    ? 'Generate a QR code to share your profile with others'
    : 'Complete at least one form above to create your legacy card'
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)
      setError(null)
      
      // Use API route instead of server-side operation
      const response = await fetch('/api/dashboard', {
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load dashboard data')
      }
      
      setDashboardData(result.data)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Failed to load dashboard. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load dashboard'}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Try Again
          </button>
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
            <div className="text-xl font-medium text-black">hushh</div>
            <Link 
              href="/about" 
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              What is this?
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Block */}
        <div className="max-w-xl mx-auto text-center md:text-left mb-16">
          {/* Eyebrow Label */}
          <div className="text-xs font-medium tracking-widest text-gray-500 uppercase mb-2">
            ✨ HUSHH LEGACY
          </div>
          
          {/* Main Heading - Two Lines with Mixed Weight */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl leading-tight mb-3">
            <div className="font-normal text-gray-800">Build your</div>
            <div className="font-bold text-black">Hushh Legacy Signature Card</div>
          </h1>
          
          {/* Subheading */}
          <p className="text-lg text-gray-600 mb-4">
            One profile. Five dimensions of your life.
          </p>
          
          {/* Body Copy */}
          <div className="text-sm text-gray-500 leading-relaxed space-y-1 mb-6">
            <p>Start by filling any of the cards below. Your details stay private and under your control.</p>
            <p>When you're ready, we'll turn it into a shareable legacy card with a QR.</p>
          </div>
          
          {/* Status Pill */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">
            No login · Private by design
          </div>
        </div>
        
        {/* Subtle Divider */}
        <div className="w-full h-px bg-gray-200 mb-12"></div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Development Info</h3>
            <div className="text-xs space-y-1 text-blue-800">
              <p>User ID: {dashboardData.user.userId}</p>
              <p>Hushh UID: {dashboardData.user.hushhUid}</p>
              <p>Legacy CTA Enabled: {dashboardData.isLegacyCTAEnabled ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}

        {/* Forms Section - 5 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {dashboardData.formCards.map((card) => (
            <Link
              key={card.key}
              href={card.route}
              className="block p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              {/* Top row - Title and Status */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-black">{card.title}</h3>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusPillStyle(card.status)}`}>
                  {getStatusText(card.status)}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-gray-600 text-sm mb-3">{card.description}</p>
              
              {/* Summary (if available) */}
              {card.summary && (
                <p className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {card.summary}
                </p>
              )}
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            className={`w-full max-w-md py-4 px-6 rounded-full text-lg font-medium transition-colors ${getCTAButtonStyle(dashboardData.isLegacyCTAEnabled)}`}
            disabled={!dashboardData.isLegacyCTAEnabled}
            onClick={() => {
              if (dashboardData.isLegacyCTAEnabled) {
                window.location.href = '/legacy/create'
              }
            }}
          >
            Create Hushh Legacy Card
          </button>
          
          <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto">
            {getCTAHelperText(dashboardData.isLegacyCTAEnabled)}
          </p>
        </div>
      </div>
    </div>
  )
}
