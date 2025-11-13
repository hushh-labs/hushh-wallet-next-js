'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LegacyCardData } from '@/types/legacy'
import QRCode from 'qrcode'

export default function LegacyCardView() {
  const [data, setData] = useState<LegacyCardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (data?.publicUrl) {
      generateQRCode(data.publicUrl)
    }
  }, [data])

  async function generateQRCode(url: string) {
    try {
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrDataURL)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  async function loadData() {
    try {
      setLoading(true)
      const response = await fetch('/api/legacy/card')
      const result = await response.json()
      
      if (!result.success) {
        if (result.error === 'no_card') {
          // No card exists, redirect to create
          window.location.href = '/legacy/create'
          return
        }
        throw new Error(result.error)
      }
      
      setData(result.data)
    } catch (err) {
      console.error('Error loading legacy card data:', err)
      // Redirect to create on error
      window.location.href = '/legacy/create'
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    if (!data) return
    
    try {
      await navigator.clipboard.writeText(data.publicUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 3000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your legacy card...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return null // Will redirect
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 mb-4">
            Legacy card
          </div>
          <h1 className="text-3xl font-bold text-black mb-4">
            Your Hushh Legacy Signature Card
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This is your live card. The QR links to a privacy-safe profile built from your answers.
          </p>
        </div>

        {/* Card Preview Component */}
        <div className="flex justify-center mb-8">
          <div className="bg-black rounded-xl shadow-2xl p-8 w-full max-w-md aspect-[5/3] flex">
            {/* Left side: QR code area */}
            <div className="flex-1 flex flex-col items-center justify-center text-white">
              <div className="w-24 h-24 bg-white rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-black text-xs font-mono">
                    Loading...
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-300">Scan to view profile</p>
            </div>
            
            {/* Right side: Card info */}
            <div className="flex-1 flex flex-col justify-between text-white pl-6">
              <div className="text-right">
                <div className="text-sm font-medium">hushh</div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Legacy Signature</div>
                <div className="text-xs text-gray-300">
                  1 profile · {data.sectionsIncluded} sections included
                </div>
              </div>
              
              <div>
                {/* Optional: Preferred name or keep minimal */}
                <div className="text-xs text-gray-300">
                  Private by design
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center mb-8">
          <div className="space-y-4">
            {/* Primary Action */}
            <button
              onClick={() => window.open(data.publicUrl, '_blank')}
              className="w-full max-w-md py-3 px-6 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-colors"
            >
              View public profile
            </button>
            
            {/* Secondary Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 transition-colors"
              >
                {copySuccess ? 'Link copied!' : 'Copy link'}
              </button>
              
              <button
                disabled
                className="px-4 py-2 border border-gray-200 text-gray-400 rounded-md cursor-not-allowed"
              >
                Download QR
              </button>
            </div>
          </div>
          
          {/* Success message */}
          {copySuccess && (
            <p className="text-green-600 text-sm mt-2">
              Link copied. Share it with anyone you trust.
            </p>
          )}
        </div>

        {/* Info Text */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 text-sm mb-4">
            You can update your details anytime from the forms on your dashboard. 
            Your card and public profile will update automatically based on your latest answers and visibility settings.
          </p>
          
          <Link 
            href="/legacy/create"
            className="text-black hover:text-gray-600 text-sm underline transition-colors"
          >
            Change what's included
          </Link>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Development Info</h3>
            <div className="text-xs space-y-1 text-blue-800">
              <p>Public Token: {data.card.public_token}</p>
              <p>Public URL: {data.publicUrl}</p>
              <p>Sections Included: {data.sectionsIncluded}</p>
              <p>User ID: {data.user.userId}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
