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
        
        {/* Test Data Section */}
        {showTestData && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                🚀 Quick Demo - Try with Sample Data
              </h3>
              <p className="text-sm text-gray-600">
                Click any profile below to instantly fill the form and see your card preview
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {TEST_PROFILES.map((profile, index) => (
                  <button
                    key={index}
                    onClick={() => loadTestData(index)}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                  >
                    <div className="space-y-2">
                      <div className="font-medium text-gray-800 group-hover:text-blue-700">
                        {profile.preferredName}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>{profile.legalName}</div>
                        <div>{profile.phone}</div>
                        <div className="capitalize">{profile.gender}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 mt-3">
                Or fill the form manually below ↓
              </div>
            </div>
          </div>
        )}

        {/* Clear Form Button */}
        {!showTestData && selectedProfile >= 0 && (
          <div className="text-center">
            <button
              onClick={clearForm}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Clear and use custom data
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
