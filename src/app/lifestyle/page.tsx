'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Segmented, Chips, Toggle } from '@/components/ui';
import { LifestyleData } from '@/types/hushh-id';
import { useAuth } from '@/contexts/AuthContext';
import { saveLifestyleData, getLifestyleData } from '@/lib/firestore';

const drinksOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

const drinkingFrequencyOptions = [
  { value: 'rarely', label: 'Rarely (≤1/mo)' },
  { value: 'occasionally', label: 'Occasionally (1-3/mo)' },
  { value: 'weekly', label: 'Weekly (1-3/wk)' },
  { value: 'often', label: 'Often (≥4/wk)' }
];

const quantityOptions = [
  { value: '1', label: '1' },
  { value: '2-3', label: '2-3' },
  { value: '4-5', label: '4-5' },
  { value: '6+', label: '6+' }
];

const drinkPreferenceOptions = [
  { value: 'beer', label: 'Beer' },
  { value: 'wine-red', label: 'Wine (Red)' },
  { value: 'wine-white', label: 'Wine (White)' },
  { value: 'wine-sparkling', label: 'Wine (Sparkling)' },
  { value: 'whisky', label: 'Whisky' },
  { value: 'vodka', label: 'Vodka' },
  { value: 'rum', label: 'Rum' },
  { value: 'gin', label: 'Gin' },
  { value: 'tequila', label: 'Tequila' },
  { value: 'cocktails', label: 'Cocktails' },
  { value: 'alcohol-free', label: 'Alcohol-free' }
];

const budgetOptions = [
  { value: '<$10', label: '<$10' },
  { value: '$10-$25', label: '$10-$25' },
  { value: '$25-$50', label: '$25-$50' },
  { value: '$50+', label: '$50+' }
];

const smokesOptions = [
  { value: 'no', label: 'No' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'daily', label: 'Daily' },
  { value: 'former', label: 'Former' }
];

const smokingTypeOptions = [
  { value: 'cigarettes', label: 'Cigarettes' },
  { value: 'cigar', label: 'Cigar' },
  { value: 'pipe', label: 'Pipe' },
  { value: 'e-cig-vape', label: 'E-cig/Vape' }
];

const smokingPeriodOptions = [
  { value: 'per-day', label: 'per day' },
  { value: 'per-week', label: 'per week' }
];

// Generate year options from current year back to 1950
const currentYear = new Date().getFullYear();
const quitYearOptions = Array.from({ length: currentYear - 1949 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString()
}));

export default function LifestyleForm() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<LifestyleData>>({
    showInQR: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const existingData = await getLifestyleData(user.uid);
          if (existingData) {
            setFormData(existingData);
          }
        } catch (error) {
          console.error('Error loading lifestyle data:', error);
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
      await saveLifestyleData(user.uid, formData);
      await refreshProfile(); // Update the profile completion status
      
      alert('Lifestyle data saved successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error saving lifestyle data:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  const updateField = (field: keyof LifestyleData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showDrinkingDetails = formData.drinks === 'yes';
  const showSmokingDetails = formData.smokes === 'occasionally' || formData.smokes === 'daily';
  const showQuitYear = formData.smokes === 'former';

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
          <h1 className="text-h3 font-semibold">Drinking & Smoking</h1>
          <div className="w-9" /> {/* Spacer for center alignment */}
        </div>
      </header>

      {/* Form Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <p className="text-small text-g600 mb-4">
            Health advice nahi; yeh sirf preference logging hai.
          </p>
        </div>

        <div className="space-y-8">
          {/* Drinking Section */}
          <div>
            <h2 className="text-h3 font-semibold mb-4 text-g900">Drinking</h2>
            <div className="space-y-4">
              <Segmented
                label="Do you drink alcohol?"
                options={drinksOptions}
                value={formData.drinks || ''}
                onChange={(value) => updateField('drinks', value as 'yes' | 'no' | 'prefer-not-to-say')}
              />

              {showDrinkingDetails && (
                <>
                  <Segmented
                    label="Frequency"
                    options={drinkingFrequencyOptions}
                    value={formData.drinkingFrequency || ''}
                    onChange={(value) => updateField('drinkingFrequency', value as 'rarely' | 'occasionally' | 'weekly' | 'often')}
                  />

                  <Segmented
                    label="Typical quantity per occasion"
                    options={quantityOptions}
                    value={formData.typicalQuantity || ''}
                    onChange={(value) => updateField('typicalQuantity', value as '1' | '2-3' | '4-5' | '6+')}
                    helper="Number of drinks in one sitting"
                  />

                  <Chips
                    label="Preferences"
                    options={drinkPreferenceOptions}
                    value={formData.drinkPreferences || []}
                    onChange={(value) => updateField('drinkPreferences', value)}
                  />

                  <Segmented
                    label="Budget (per drink)"
                    options={budgetOptions}
                    value={formData.drinkBudget || ''}
                    onChange={(value) => updateField('drinkBudget', value as '<$10' | '$10-$25' | '$25-$50' | '$50+')}
                  />

                  <div>
                    <label className="block text-meta mb-2">Dislikes (optional)</label>
                    <input
                      type="text"
                      value={formData.drinkDislikes || ''}
                      onChange={(e) => updateField('drinkDislikes', e.target.value)}
                      placeholder="e.g., too sweet, bitter"
                      maxLength={60}
                      className="input"
                    />
                    <p className="text-tiny text-g500 mt-1">
                      {(formData.drinkDislikes || '').length}/60 characters
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Smoking Section */}
          <div>
            <h2 className="text-h3 font-semibold mb-4 text-g900">Smoking</h2>
            <div className="space-y-4">
              <Segmented
                label="Do you smoke?"
                options={smokesOptions}
                value={formData.smokes || ''}
                onChange={(value) => updateField('smokes', value as 'no' | 'occasionally' | 'daily' | 'former')}
              />

              {showSmokingDetails && (
                <>
                  <Chips
                    label="Type"
                    options={smokingTypeOptions}
                    value={formData.smokingTypes || []}
                    onChange={(value) => updateField('smokingTypes', value)}
                  />

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-meta mb-2">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={formData.smokingQuantity || ''}
                        onChange={(e) => updateField('smokingQuantity', parseInt(e.target.value) || 0)}
                        className="input"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <Segmented
                        label="Period"
                        options={smokingPeriodOptions}
                        value={formData.smokingPeriod || 'per-day'}
                        onChange={(value) => updateField('smokingPeriod', value as 'per-day' | 'per-week')}
                      />
                    </div>
                  </div>
                </>
              )}

              {showQuitYear && (
                <div>
                  <label className="block text-meta mb-2">Quit year</label>
                  <select
                    value={formData.quitYear || ''}
                    onChange={(e) => updateField('quitYear', parseInt(e.target.value) || undefined)}
                    className="input"
                  >
                    <option value="">Select year</option>
                    {quitYearOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Sharing Controls */}
          <div>
            <h3 className="text-h3 font-semibold mb-4 text-g900">Sharing Settings</h3>
            <div className="space-y-4">
              <Toggle
                label="Show in QR"
                checked={formData.showInQR || false}
                onChange={(checked) => updateField('showInQR', checked)}
                helper="Share general lifestyle summary when QR is scanned"
              />

              {formData.showInQR && (
                <div className="bg-g200 p-3 rounded-lg">
                  <p className="text-tiny text-g600">
                    <strong>Summary preview:</strong> 
                    {formData.drinks === 'no' && ' Doesn\'t drink'}
                    {formData.drinks === 'yes' && ' Social drinker'}
                    {formData.smokes === 'no' && ', Non-smoker'}
                    {formData.smokes === 'daily' && ', Smoker'}
                    {formData.smokes === 'occasionally' && ', Occasional smoker'}
                    {formData.smokes === 'former' && ', Former smoker'}
                    {!formData.drinks && !formData.smokes && ' Lifestyle preferences not specified'}
                  </p>
                </div>
              )}
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
            This information is for preference tracking only, not health advice.
          </p>
        </div>
      </div>
    </div>
  );
}
