'use client';

import React, { useState } from 'react';
import { validateEmail, validateUSPhone, validateName } from '@/lib/goldpass';

interface ClaimResponse {
  success: boolean;
  uid?: string;
  addToWalletUrl?: string;
  profileUrl?: string;
  errors?: string[];
  error?: string;
}

export default function HushhGoldLanding() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimResponse, setClaimResponse] = useState<ClaimResponse | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Real-time validation
  const validateForm = () => {
    const errors: string[] = [];
    
    const nameValidation = validateName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validateUSPhone(formData.phone);
    
    errors.push(...nameValidation.errors);
    errors.push(...emailValidation.errors);
    errors.push(...phoneValidation.errors);
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear previous response when user starts typing
    if (claimResponse) {
      setClaimResponse(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result: ClaimResponse = await response.json();
      setClaimResponse(result);
      
      // If successful and on iOS Safari, automatically try to open the pass
      if (result.success && result.addToWalletUrl) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        if (isIOS && isSafari) {
          // Small delay to show success message first
          setTimeout(() => {
            window.location.href = result.addToWalletUrl!;
          }, 1000);
        }
      }
      
    } catch (error) {
      console.error('Claim error:', error);
      setClaimResponse({
        success: false,
        error: 'Network error. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToWallet = () => {
    if (claimResponse?.addToWalletUrl) {
      window.open(claimResponse.addToWalletUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">
            🏆 Hushh Gold Membership
          </h1>
          <p className="text-center mt-2 text-amber-100">
            Exclusive membership • Apple Wallet ready • No login required
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-md">
        {!claimResponse ? (
          <>
            {/* Main Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">✨</div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Claim Your Gold Pass
                </h2>
                <p className="text-gray-600 mt-2">
                  Get instant access to exclusive Hushh benefits
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    US Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    10 or 11 digits (with or without country code)
                  </p>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800 mb-1">
                      Please fix these issues:
                    </p>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating your Gold Pass...
                    </span>
                  ) : (
                    '🏆 Claim Gold Membership'
                  )}
                </button>
              </form>

              {/* Benefits List */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  ✨ Gold Member Benefits
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Instant Apple Wallet integration
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Exclusive member privileges
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    QR verification system
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Premium support access
                  </li>
                </ul>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">🔒 Privacy First:</span> No passwords required. 
                Your data is encrypted and only used for membership verification.
              </p>
            </div>
          </>
        ) : (
          /* Success/Error Response */
          <div className="bg-white rounded-xl shadow-lg p-6">
            {claimResponse.success ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold text-green-800">
                    Gold Pass Ready!
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Your exclusive membership has been created
                  </p>
                </div>

                {/* Add to Wallet Button */}
                <button
                  onClick={handleAddToWallet}
                  className="w-full bg-black text-white py-4 px-6 rounded-lg font-semibold shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 mb-4"
                >
                  📱 Add to Apple Wallet
                </button>

                {/* Member Info */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-amber-800 mb-2">
                    🏆 Welcome, Gold Member!
                  </h3>
                  <p className="text-sm text-amber-700">
                    <span className="font-medium">Member ID:</span> {claimResponse.uid}
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Your pass includes QR verification and exclusive benefits.
                  </p>
                </div>

                {/* Profile Completion CTA */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    📍 Complete Your Profile
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Add your address to unlock additional features and personalized experiences.
                  </p>
                  <a
                    href={claimResponse.profileUrl}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Complete Profile →
                  </a>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setClaimResponse(null);
                    setFormData({ name: '', email: '', phone: '' });
                  }}
                  className="w-full mt-4 text-gray-500 text-sm hover:text-gray-700"
                >
                  ← Claim another pass
                </button>
              </>
            ) : (
              /* Error State */
              <>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">❌</div>
                  <h2 className="text-2xl font-bold text-red-800">
                    Claim Failed
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {claimResponse.error || 'Something went wrong'}
                  </p>
                </div>

                {/* Error Details */}
                {claimResponse.errors && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-red-800 mb-2">
                      Issues found:
                    </p>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                      {claimResponse.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Retry Button */}
                <button
                  onClick={() => setClaimResponse(null)}
                  className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  ← Try Again
                </button>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Powered by <span className="font-semibold">Hushh Technologies</span>
          </p>
          <p className="mt-1">
            Secure • Frictionless • Premium
          </p>
        </div>
      </div>
    </div>
  );
}
