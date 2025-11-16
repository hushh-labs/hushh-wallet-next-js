'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  validateCity,
  validateUSState,
  validateZIP,
  validateGender,
  validateAge,
  US_STATES 
} from '@/lib/goldpass';

interface ProfileCompleteProps {
  params: Promise<{
    uid: string;
  }>;
}

interface ProfileData {
  city: string;
  state: string;
  zip: string;
  gender: 'male' | 'female' | '';
  age: string;
  street1: string;
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  errors?: string[];
  error?: string;
}

export default function ProfileCompletePage({ params }: ProfileCompleteProps) {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [uid, setUid] = useState<string>('');
  const [formData, setFormData] = useState<ProfileData>({
    city: '',
    state: '',
    zip: '',
    gender: '',
    age: '',
    street1: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<ProfileResponse | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Resolve params and check for token on mount
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setUid(resolvedParams.uid);
    };
    resolveParams();
    
    if (!token) {
      setResponse({
        success: false,
        error: 'Invalid or missing authentication token'
      });
    }
  }, [params, token]);

  // Real-time validation
  const validateForm = () => {
    const errors: string[] = [];
    
    if (formData.city.trim()) {
      const cityValidation = validateCity(formData.city);
      errors.push(...cityValidation.errors);
    }
    
    if (formData.state) {
      const stateValidation = validateUSState(formData.state);
      errors.push(...stateValidation.errors);
    }
    
    if (formData.zip.trim()) {
      const zipValidation = validateZIP(formData.zip);
      errors.push(...zipValidation.errors);
    }
    
    if (formData.gender) {
      const genderValidation = validateGender(formData.gender);
      errors.push(...genderValidation.errors);
    }
    
    if (formData.age.trim()) {
      const ageValidation = validateAge(parseInt(formData.age, 10));
      errors.push(...ageValidation.errors);
    }
    
    // Check required fields
    const requiredFields = ['city', 'state', 'zip', 'gender', 'age'];
    for (const field of requiredFields) {
      if (!formData[field as keyof ProfileData]?.toString().trim()) {
        errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear previous response when user starts typing
    if (response) {
      setResponse(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setResponse({
        success: false,
        error: 'Missing authentication token'
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = {
        uid: uid,
        token,
        city: formData.city.trim(),
        state: formData.state,
        zip: formData.zip.trim(),
        gender: formData.gender,
        age: parseInt(formData.age, 10),
        ...(formData.street1.trim() && { street1: formData.street1.trim() })
      };
      
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
      
      const result: ProfileResponse = await response.json();
      setResponse(result);
      
    } catch (error) {
      console.error('Profile completion error:', error);
      setResponse({
        success: false,
        error: 'Network error. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state while checking token
  if (!token && !response) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">
            📍 Complete Your Profile
          </h1>
          <p className="text-center mt-2 text-blue-100">
            Add your US address for personalized experiences
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-md">
        {!response || !response.success ? (
          <>
            {/* Profile Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🏠</div>
                <h2 className="text-xl font-bold text-gray-800">
                  Profile Information
                </h2>
                <p className="text-gray-600 mt-2 text-sm">
                  Help us personalize your Gold member experience
                </p>
              </div>

              {response && !response.success && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">
                    ⚠️ Unable to Complete Profile
                  </h3>
                  <p className="text-sm text-red-700">
                    {response.error || 'Please check your information and try again.'}
                  </p>
                  {response.errors && (
                    <ul className="text-sm text-red-700 list-disc list-inside mt-2 space-y-1">
                      {response.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Street Address (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="street1"
                    value={formData.street1}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="San Francisco"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* State and ZIP */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select...</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      placeholder="94102"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Gender and Age */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="25"
                      min="13"
                      max="120"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
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
                  disabled={isSubmitting || !token}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Profile...
                    </span>
                  ) : (
                    '✅ Complete Profile'
                  )}
                </button>
              </form>

              {/* Privacy Notice */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  🔒 Privacy & Security
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    <span>Your data is encrypted and stored securely</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    <span>Age minimum 13+ for COPPA compliance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    <span>Used only for personalization</span>
                  </li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          /* Success Response */
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-800">
                Profile Complete!
              </h2>
              <p className="text-gray-600 mt-2">
                Your Gold membership is now fully activated
              </p>
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">
                ✅ Successfully Updated
              </h3>
              <p className="text-sm text-green-700">
                {response.message || 'Your profile has been saved and your Gold pass updated.'}
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                🚀 What's Next?
              </h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">•</span>
                  Your Gold pass now includes location-based features
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">•</span>
                  Personalized recommendations are active
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">•</span>
                  Premium support is available to you
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <a
                href={`/u/${uid}`}
                className="block w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-200"
              >
                🏆 View My Gold Profile
              </a>
              
              <a
                href="/"
                className="block w-full bg-gray-100 text-gray-700 text-center py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                ← Return to Home
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Secured by <span className="font-semibold">Hushh Technologies</span>
          </p>
          <p className="mt-1">
            Private • Encrypted • Compliant
          </p>
        </div>
      </div>
    </div>
  );
}
