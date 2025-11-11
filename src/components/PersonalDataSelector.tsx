'use client';

import { useState } from 'react';
import { PersonalPayload } from '@/types';

interface PersonalDataSelectorProps {
  onGenerate: (data: PersonalPayload) => void;
  isGenerating?: boolean;
}

export function PersonalDataSelector({ onGenerate, isGenerating = false }: PersonalDataSelectorProps) {
  const [formData, setFormData] = useState<Partial<PersonalPayload>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-8">
        
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
          <input
            type="text"
            value={formData.legalName || ''}
            onChange={(e) => updateFormData('legalName', e.target.value)}
            placeholder="e.g., John Smith"
            className={`form-input ${errors.legalName ? 'error' : ''}`}
          />
          {errors.legalName && <div className="field-error">{errors.legalName}</div>}
        </div>

        {/* Preferred Name */}
        <div className="form-group">
          <label className="form-label">Preferred Name *</label>
          <input
            type="text"
            value={formData.preferredName || ''}
            onChange={(e) => updateFormData('preferredName', e.target.value)}
            placeholder="John"
            className={`form-input ${errors.preferredName ? 'error' : ''}`}
          />
          {errors.preferredName && <div className="field-error">{errors.preferredName}</div>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => updateFormData('phone', e.target.value)}
            placeholder="+1 555-123-4567"
            className={`form-input ${errors.phone ? 'error' : ''}`}
          />
          <p className="form-helper">Include country code (e.g., +91 for India, +1 for US)</p>
          {errors.phone && <div className="field-error">{errors.phone}</div>}
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label className="form-label">Date of Birth *</label>
          <input
            type="date"
            value={formData.dob || ''}
            onChange={(e) => updateFormData('dob', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            min="1900-01-01"
            className={`form-input ${errors.dob ? 'error' : ''}`}
          />
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
