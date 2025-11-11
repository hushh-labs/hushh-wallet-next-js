'use client';

import { useState, useEffect } from 'react';
import { PersonalPayload } from '@/types';

interface PersonalDataSelectorProps {
  onGenerate: (data: PersonalPayload) => void;
  isGenerating?: boolean;
}

// Test data options for demonstration
const TEST_PROFILES: PersonalPayload[] = [
  {
    gender: 'male' as const,
    legalName: 'Ankit Kumar Singh',
    preferredName: 'Ankit',
    phone: '+91 9876543210',
    dob: '1995-06-15'
  },
  {
    gender: 'female' as const,
    legalName: 'Priya Sharma',
    preferredName: 'Priya',
    phone: '+91 9123456789',
    dob: '1992-03-22'
  },
  {
    gender: 'male' as const,
    legalName: 'Rahul Verma',
    preferredName: 'Rahul',
    phone: '+1 5551234567',
    dob: '1988-11-08'
  }
];

export function PersonalDataSelector({ onGenerate, isGenerating = false }: PersonalDataSelectorProps) {
  const [formData, setFormData] = useState<Partial<PersonalPayload>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [showTestData, setShowTestData] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<number>(-1);

  // Handle form field updates
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-fill preferred name from legal name
    if (field === 'legalName' && !formData.preferredName) {
      const firstName = value.split(' ')[0];
      setFormData(prev => ({ ...prev, preferredName: firstName }));
    }
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }
    if (!formData.legalName || formData.legalName.trim() === '') {
      newErrors.legalName = 'Legal name is required';
    }
    if (!formData.preferredName || formData.preferredName.trim() === '') {
      newErrors.preferredName = 'Preferred name is required';
    }
    if (!formData.phone || formData.phone.trim() === '') {
      newErrors.phone = 'Phone number is required';
    } else {
      // Phone validation
      const phoneRegex = /^\+[1-9]\d{8,14}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter valid phone with country code (e.g., +91 9876543210)';
      }
    }
    if (!formData.dob || formData.dob.trim() === '') {
      newErrors.dob = 'Date of birth is required';
    } else {
      // Date validation
      const birthDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 1 || age > 120 || birthDate > today) {
        newErrors.dob = 'Please enter a valid date of birth';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    if (!validateForm()) return;

    const personalData: PersonalPayload = {
      gender: formData.gender!,
      legalName: formData.legalName!,
      preferredName: formData.preferredName!,
      phone: formData.phone!,
      dob: formData.dob!
    };

    onGenerate(personalData);
  };

  const canGenerate = (): boolean => {
    return !!(formData.gender && 
              formData.legalName?.trim() && 
              formData.preferredName?.trim() && 
              formData.phone?.trim() && 
              formData.dob?.trim());
  };

  // Load test data
  const loadTestData = (profileIndex: number) => {
    if (profileIndex >= 0 && profileIndex < TEST_PROFILES.length) {
      const profile = TEST_PROFILES[profileIndex];
      setFormData(profile);
      setSelectedProfile(profileIndex);
      setShowTestData(false);
      setErrors({});
    }
  };

  // Clear form
  const clearForm = () => {
    setFormData({});
    setSelectedProfile(-1);
    setErrors({});
    setShowTestData(true);
  };

  // Auto-fill animation effect
  useEffect(() => {
    if (selectedProfile >= 0) {
      const profile = TEST_PROFILES[selectedProfile];
      const fields = ['gender', 'legalName', 'preferredName', 'phone', 'dob'];
      
      fields.forEach((field, index) => {
        setTimeout(() => {
          setIsTyping(prev => ({ ...prev, [field]: true }));
          setTimeout(() => {
            setIsTyping(prev => ({ ...prev, [field]: false }));
          }, 300);
        }, index * 200);
      });
    }
  }, [selectedProfile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-8">
        
        {/* Test Data Section - Luxury Design */}
        {showTestData && (
          <div className="relative">
            {/* Premium Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl opacity-95"></div>
            <div className="relative bg-gradient-to-r from-slate-50/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="text-center space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Quick Demo
                  </h3>
                  <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full mx-auto"></div>
                </div>
                <p className="text-amber-100/90 text-lg font-medium">
                  Try with premium sample profiles
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                  {TEST_PROFILES.map((profile, index) => {
                    const gradients = [
                      'from-blue-600 via-blue-700 to-indigo-800',
                      'from-purple-600 via-pink-600 to-rose-700', 
                      'from-emerald-600 via-teal-600 to-cyan-700'
                    ];
                    const avatarGradients = [
                      'from-blue-400 to-blue-600',
                      'from-purple-400 to-pink-500',
                      'from-emerald-400 to-teal-500'
                    ];
                    
                    return (
                      <button
                        key={index}
                        onClick={() => loadTestData(index)}
                        className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                      >
                        {/* Card Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-90`}></div>
                        
                        {/* Glass Effect */}
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                        
                        {/* Content */}
                        <div className="relative p-6 space-y-4">
                          {/* Avatar */}
                          <div className="flex justify-center">
                            <div className={`w-16 h-16 bg-gradient-to-br ${avatarGradients[index]} rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                              <span className="text-2xl font-bold text-white">
                                {profile.preferredName[0]}
                              </span>
                            </div>
                          </div>
                          
                          {/* Profile Info */}
                          <div className="space-y-3">
                            <div className="text-center">
                              <h4 className="text-xl font-bold text-white group-hover:text-amber-200 transition-colors duration-200">
                                {profile.preferredName}
                              </h4>
                              <div className="w-12 h-0.5 bg-white/30 rounded-full mx-auto mt-2"></div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                                <span className="text-white/90 font-medium">{profile.legalName}</span>
                              </div>
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                                <span className="text-white/75">{profile.phone}</span>
                              </div>
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                                <span className="text-white/75 capitalize">{profile.gender}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Hover Effect */}
                          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-2xl"></div>
                        </div>
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-center space-x-3 mt-6">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-amber-400/60 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-amber-400/30 rounded-full animate-pulse delay-200"></div>
                  </div>
                  <p className="text-amber-200/80 text-sm font-medium">
                    Or create custom profile below
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clear Form Button - Luxury Style */}
        {!showTestData && selectedProfile >= 0 && (
          <div className="text-center">
            <button
              onClick={clearForm}
              className="group inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-4 h-4 group-hover:text-amber-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Clear and use custom data</span>
            </button>
          </div>
        )}
        
        {/* Gender */}
        <div className="form-group">
          <label className="form-label">Gender *</label>
          <div className="radio-group">
            {['Male', 'Female', 'Other'].map((option) => (
              <label key={option} className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value={option.toLowerCase()}
                  checked={formData.gender === option.toLowerCase()}
                  onChange={(e) => updateFormData('gender', e.target.value)}
                  className="radio-input"
                />
                <span className="radio-label">{option}</span>
              </label>
            ))}
          </div>
          {errors.gender && <div className="field-error">{errors.gender}</div>}
        </div>

        {/* Legal Name */}
        <div className="form-group">
          <label className="form-label">Legal Name *</label>
          <div className="relative">
            <input
              type="text"
              value={formData.legalName || ''}
              onChange={(e) => updateFormData('legalName', e.target.value)}
              placeholder="e.g., Anita Sharma"
              className={`form-input ${errors.legalName ? 'error' : ''} ${isTyping.legalName ? 'ring-2 ring-blue-200' : ''}`}
            />
            {isTyping.legalName && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.legalName && <div className="field-error">{errors.legalName}</div>}
        </div>

        {/* Preferred Name */}
        <div className="form-group">
          <label className="form-label">Preferred Name *</label>
          <div className="relative">
            <input
              type="text"
              value={formData.preferredName || ''}
              onChange={(e) => updateFormData('preferredName', e.target.value)}
              placeholder="Anita"
              className={`form-input ${errors.preferredName ? 'error' : ''} ${isTyping.preferredName ? 'ring-2 ring-blue-200' : ''}`}
            />
            {isTyping.preferredName && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.preferredName && <div className="field-error">{errors.preferredName}</div>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <div className="relative">
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => updateFormData('phone', e.target.value)}
              placeholder="+91 98••• 1234"
              className={`form-input ${errors.phone ? 'error' : ''} ${isTyping.phone ? 'ring-2 ring-blue-200' : ''}`}
            />
            {isTyping.phone && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <p className="form-helper">Include country code (e.g., +91 for India)</p>
          {errors.phone && <div className="field-error">{errors.phone}</div>}
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label className="form-label">Date of Birth *</label>
          <div className="relative">
            <input
              type="date"
              value={formData.dob || ''}
              onChange={(e) => updateFormData('dob', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min="1900-01-01"
              className={`form-input ${errors.dob ? 'error' : ''} ${isTyping.dob ? 'ring-2 ring-blue-200' : ''}`}
            />
            {isTyping.dob && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.dob && <div className="field-error">{errors.dob}</div>}
        </div>

        {/* Generate Button */}
        <div className="pt-6">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate() || isGenerating}
            className={`btn-primary w-full ${(!canGenerate() || isGenerating) ? 'disabled' : ''}`}
          >
            {isGenerating ? 'Loading Preview...' : 'Preview Card'}
          </button>
          
          {!canGenerate() && (
            <p className="text-sm text-muted text-center mt-3">
              Please fill all required fields to preview your card
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
