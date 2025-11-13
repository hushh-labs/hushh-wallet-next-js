import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="text-xl font-medium text-black">← hushh</Link>
            <div className="text-sm text-gray-600">About</div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">What is Hushh?</h1>
          <p className="text-xl text-gray-600">
            A privacy-first personal data sharing platform
          </p>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Privacy by Design</h2>
            <p className="text-blue-800 mb-0">
              You control exactly what information you share, with whom, and when. 
              Nothing is shared publicly without your explicit permission.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-black mb-4">How it works</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium text-black mb-2">1. Fill out your profiles</h3>
              <p className="text-gray-600">
                Complete forms for different aspects of your life - identity, financial outlook, 
                body measurements, food preferences, and lifestyle habits. You decide how much 
                or how little to share in each category.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-black mb-2">2. Set your privacy levels</h3>
              <p className="text-gray-600">
                For each piece of information, choose whether it's public, trusted contacts only, 
                or completely private. You can even create custom visibility rules for different situations.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-black mb-2">3. Generate your QR card</h3>
              <p className="text-gray-600">
                Create a shareable digital card with a QR code. When someone scans it, they see 
                only the information you've chosen to make public - perfect for networking, dating, 
                or sharing preferences at restaurants.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-black mb-2">4. Share selectively</h3>
              <p className="text-gray-600">
                Use your QR code in different contexts. Share basic info publicly while keeping 
                sensitive details for trusted contacts. Update your preferences anytime.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mt-8">
            <h2 className="text-xl font-semibold text-black mb-4">Use cases</h2>
            <ul className="space-y-2 text-gray-600">
              <li><strong>Restaurants:</strong> Share dietary restrictions and preferences</li>
              <li><strong>Networking:</strong> Professional contact info and interests</li>
              <li><strong>Dating:</strong> Lifestyle compatibility at a glance</li>
              <li><strong>Shopping:</strong> Size and fit preferences for recommendations</li>
              <li><strong>Healthcare:</strong> Emergency contacts and medical info</li>
              <li><strong>Events:</strong> Quick introductions and icebreakers</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold text-black mb-4 mt-8">Your data, your rules</h2>
          
          <p className="text-gray-600 mb-4">
            We believe your personal information belongs to you. Hushh gives you granular 
            control over your data with transparent privacy settings. We don't sell your 
            information, and we don't use it for advertising.
          </p>

          <p className="text-gray-600">
            Ready to take control of how you share your personal information? 
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
              Get started
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
