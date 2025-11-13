'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Segmented, Chips, Toggle, Card } from '@/components/ui';
import { IdentityData, VisibilityLevel } from '@/types/hushh-id';
import { useAuth } from '@/contexts/AuthContext';
import { saveIdentityData, getIdentityData } from '@/lib/firestore';

const genderIdentityOptions = [
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

const sexAtBirthOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

const pronounOptions = [
  { value: 'she-her', label: 'She/Her' },
  { value: 'he-him', label: 'He/Him' },
  { value: 'they-them', label: 'They/Them' },
  { value: 'self-describe', label: 'Self-describe' }
];

const visibilityOptions = [
  { value: 'public', label: 'Public' },
  { value: 'trusted', label: 'Trusted' },
  { value: 'private', label: 'Private' }
];

export default function IdentityForm() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<IdentityData>>({
    visibility: {
      fullName: 'private',
      cityCountry: 'private',
      yearOfBirth: 'private',
      email: 'private',
      phone: 'private'
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const existingData = await getIdentityData(user.uid);
          if (existingData) {
            setFormData(existingData);
          }
        } catch (error) {
          console.error('Error loading identity data:', error);
        }
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-g100">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-g300 rounded-full mx-auto mb-4"></div>
              <p className="text-small text-g600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const BackArrow = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save your data');
      return;
    }

    setIsSaving(true);
    try {
      await saveIdentityData(user.uid, formData);
      await refreshProfile(); // Update the profile completion status
      
      // Simple success feedback (can be enhanced with toast later)
      alert('Identity data saved successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error saving identity data:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  const updateField = (field: keyof IdentityData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateVisibility = (field: keyof IdentityData['visibility'], value: VisibilityLevel) => {
    setFormData(prev => ({
      ...prev,
      visibility: {
        fullName: 'private' as VisibilityLevel,
        cityCountry: 'private' as VisibilityLevel,
        yearOfBirth: 'private' as VisibilityLevel,
        email: 'private' as VisibilityLevel,
        phone: 'private' as VisibilityLevel,
        ...prev.visibility,
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-g100">
      {/* App Bar */}
      <header className="bg-g100 border-b border-g200 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="tap-target p-2 -ml-2 text-g700 hover:text-g900"
          >
            <BackArrow />
          </button>
          <h1 className="text-h3 font-semibold">Identity</h1>
          <div className="w-9" /> {/* Spacer for center alignment */}
        </div>
      </header>

      {/* Form Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <p className="text-small text-g600 mb-4">
            Aap decide karte ho kaunse details scan par dikhein.
          </p>
        </div>

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <Input
              label="Full name"
              placeholder="e.g., Aditi Sharma"
              value={formData.fullName || ''}
              onChange={(e) => updateField('fullName', e.target.value)}
              helper="As you'd like it on the card"
            />
            <div className="mt-3">
              <Segmented
                label="Visibility"
                options={visibilityOptions}
                value={formData.visibility?.fullName || 'private'}
                onChange={(value) => updateVisibility('fullName', value as VisibilityLevel)}
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <Input
              type="date"
              label="Date of birth"
              value={formData.dateOfBirth || ''}
              onChange={(e) => updateField('dateOfBirth', e.target.value)}
            />
            <div className="mt-3">
              <Toggle
                label="Share year only in QR"
                checked={formData.shareYearOnly || false}
                onChange={(checked) => updateField('shareYearOnly', checked)}
              />
            </div>
            <div className="mt-3">
              <Segmented
                label="Year visibility"
                options={visibilityOptions}
                value={formData.visibility?.yearOfBirth || 'private'}
                onChange={(value) => updateVisibility('yearOfBirth', value as VisibilityLevel)}
              />
            </div>
          </div>

          {/* Sex at Birth */}
          <div>
            <Segmented
              label="Sex (at birth)"
              options={sexAtBirthOptions}
              value={formData.sexAtBirth || ''}
              onChange={(value) => updateField('sexAtBirth', value)}
            />
          </div>

          {/* Gender Identity */}
          <div>
            <Chips
              label="Gender identity (optional)"
              options={genderIdentityOptions}
              value={formData.genderIdentity || []}
              onChange={(value) => updateField('genderIdentity', value)}
              maxSelection={2}
            />
            {formData.genderIdentity?.includes('custom') && (
              <div className="mt-3">
                <Input
                  placeholder="Self-describe"
                  value={formData.customGenderIdentity || ''}
                  onChange={(e) => updateField('customGenderIdentity', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Pronouns */}
          <div>
            <Chips
              label="Pronouns (optional)"
              options={pronounOptions}
              value={formData.pronouns || []}
              onChange={(value) => updateField('pronouns', value)}
              maxSelection={1}
            />
            {formData.pronouns?.includes('self-describe') && (
              <div className="mt-3">
                <Input
                  placeholder="Custom pronouns"
                  value={formData.customPronouns || ''}
                  onChange={(e) => updateField('customPronouns', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* City */}
          <div>
            <Input
              label="City"
              placeholder="e.g., Bengaluru"
              value={formData.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
            />
          </div>

          {/* Country */}
          <div>
            <Input
              label="Country"
              placeholder="e.g., India"
              value={formData.country || ''}
              onChange={(e) => updateField('country', e.target.value)}
            />
            <div className="mt-3">
              <Segmented
                label="City/Country visibility"
                options={visibilityOptions}
                value={formData.visibility?.cityCountry || 'private'}
                onChange={(value) => updateVisibility('cityCountry', value as VisibilityLevel)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Input
              type="email"
              label="Email"
              placeholder="your.email@example.com"
              value={formData.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
            />
            <div className="mt-3">
              <Segmented
                label="Email visibility"
                options={visibilityOptions}
                value={formData.visibility?.email || 'private'}
                onChange={(value) => updateVisibility('email', value as VisibilityLevel)}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <Input
              type="tel"
              label="Phone"
              placeholder="+91 98765 43210"
              value={formData.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            <div className="mt-3">
              <Segmented
                label="Phone visibility"
                options={visibilityOptions}
                value={formData.visibility?.phone || 'private'}
                onChange={(value) => updateVisibility('phone', value as VisibilityLevel)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3 pb-8">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full"
            disabled={isSaving}
          >
            Skip for now
          </Button>
        </div>

        {/* Info Footer */}
        <div className="mt-4 p-4 bg-g200 rounded-lg">
          <p className="text-tiny text-center text-g600">
            You control what appears when your QR is scanned.
          </p>
        </div>
      </div>
    </div>
  );
}
