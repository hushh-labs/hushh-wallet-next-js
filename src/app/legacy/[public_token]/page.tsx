import Link from 'next/link'
import { getPublicProfileData, debugPublicViewer } from '@/utils/public-viewer/service'
import { PublicViewerPageProps, PublicProfileData } from '@/types/public-viewer'

// Error state components
function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-black mb-4">Profile not found</h1>
          <p className="text-gray-600">
            This legacy profile is no longer available. The link may be incorrect or the card may have been updated.
          </p>
        </div>
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          Visit hushh.ai
        </Link>
      </div>
    </div>
  )
}

function EmptyProfile() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-6">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-black mb-4">Profile is currently empty</h1>
          <p className="text-gray-600">
            The owner of this legacy card hasn't chosen any details to share publicly right now.
          </p>
        </div>
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          Visit hushh.ai
        </Link>
      </div>
    </div>
  )
}

function ServerError() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-black mb-4">Something went wrong</h1>
          <p className="text-gray-600">
            We're having trouble loading this profile right now. Please try again in a moment.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

// Section component for each profile section
function ProfileSection({ title, lines }: { title: string; lines: string[] }) {
  if (lines.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-black mb-3">{title}</h2>
      <div className="space-y-1">
        {lines.map((line, index) => (
          <p key={index} className="text-gray-700 text-sm">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

// Main public profile component
function PublicProfile({ data }: { data: PublicProfileData }) {
  const visibleSections = [
    { key: 'identity', title: 'Identity', section: data.sections.identity },
    { key: 'bodyfit', title: 'Body & fit', section: data.sections.bodyfit },
    { key: 'food', title: 'Food preferences', section: data.sections.food },
    { key: 'lifestyle', title: 'Lifestyle', section: data.sections.lifestyle },
    { key: 'networth', title: 'Net worth', section: data.sections.networth }
  ].filter(({ section }) => section.visible)

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-xl font-medium text-black">hushh</div>
            <Link 
              href="/about" 
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              What is hushh?
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 mb-4">
            Legacy profile
          </div>
          <h1 className="text-3xl font-bold text-black mb-4">
            {data.cardTitle}
          </h1>
          <div className="space-y-2 text-gray-600 max-w-lg mx-auto">
            <p>A high-level profile shared via hushh.ai.</p>
            <p>All details are shown with the owner's consent.</p>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-8 mb-12">
          {visibleSections.map(({ key, title, section }) => (
            <ProfileSection 
              key={key}
              title={title} 
              lines={section.lines} 
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-100 pt-8">
          <p className="text-gray-500 text-sm mb-4">
            This profile is shared through hushh.ai. It may change over time as the owner updates their answers.
          </p>
          <Link 
            href="/about"
            className="text-black hover:text-gray-600 text-sm underline transition-colors"
          >
            Learn more about hushh →
          </Link>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Development Info</h3>
            <div className="text-xs space-y-1 text-blue-800">
              <p>Visible Sections: {visibleSections.map(s => s.key).join(', ')}</p>
              <p>Total Lines: {visibleSections.reduce((sum, s) => sum + s.section.lines.length, 0)}</p>
              <p>Last Updated: {data.lastUpdated}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main page component
export default async function PublicViewerPage({ params }: PublicViewerPageProps) {
  const { public_token } = params

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    await debugPublicViewer(public_token)
  }

  // Get public profile data
  const result = await getPublicProfileData(public_token)

  // Handle error states
  if (!result.success) {
    switch (result.error) {
      case 'not_found':
        return <ProfileNotFound />
      case 'empty_profile':
        return <EmptyProfile />
      case 'server_error':
      default:
        return <ServerError />
    }
  }

  // Render successful profile
  return <PublicProfile data={result.data!} />
}

// Metadata for SEO
export async function generateMetadata({ params }: PublicViewerPageProps) {
  const { public_token } = params
  
  return {
    title: 'Hushh Legacy Signature Card',
    description: 'A privacy-safe profile shared through hushh.ai',
    robots: {
      index: false, // Don't index these pages
      follow: false
    }
  }
}
