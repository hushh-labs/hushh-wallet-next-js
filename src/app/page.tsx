'use client';

import { useState } from 'react';

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim pass');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-yellow-600">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">HUSHH</h1>
            <p className="text-xl text-yellow-200 font-semibold">Gold Pass</p>
            <p className="text-sm text-white/80 mt-4">
              Exclusive access to premium experiences
            </p>
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-white font-medium mb-2">
                  US Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <p className="text-white text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 font-bold py-4 px-6 rounded-lg shadow-lg hover:from-yellow-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating your pass...
                  </span>
                ) : (
                  'Get My Gold Pass'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-white font-medium">
                  {result.existing ? 'Welcome back!' : 'Success!'} Your HUSHH Gold Pass is ready.
                </p>
              </div>

              {isIOS() ? (
                <a
                  href={result.addToWalletUrl}
                  className="block w-full bg-black text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  📱 Add to Apple Wallet
                </a>
              ) : (
                <div className="space-y-4">
                  <p className="text-white/80 text-sm">
                    To add to Apple Wallet, open this link on your iPhone:
                  </p>
                  <a
                    href={result.addToWalletUrl}
                    className="block w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200"
                  >
                    Download Pass File
                  </a>
                </div>
              )}

              <a
                href={result.profileUrl}
                className="block w-full bg-white/20 border border-white/30 text-white font-medium py-3 px-6 rounded-lg hover:bg-white/30 transition-all duration-200"
              >
                Complete Your Profile
              </a>

              <button
                onClick={() => {
                  setResult(null);
                  setFormData({ name: '', email: '', phone: '' });
                }}
                className="text-white/60 hover:text-white text-sm underline"
              >
                Create another pass
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            Powered by HUSHH • Premium membership platform
          </p>
        </div>
      </div>
    </div>
  );
}
