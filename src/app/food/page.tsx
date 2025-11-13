'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Segmented, Chips, Toggle } from '@/components/ui';
import { FoodPreferencesData } from '@/types/hushh-id';
import { useAuth } from '@/contexts/AuthContext';
import { saveFoodPreferencesData, getFoodPreferencesData } from '@/lib/firestore';

const dietTypeOptions = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'no-preference', label: 'No preference' }
];

const allergenOptions = [
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'tree-nuts', label: 'Tree nuts' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'wheat-gluten', label: 'Wheat/Gluten' },
  { value: 'soy', label: 'Soy' },
  { value: 'fish', label: 'Fish' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'sesame', label: 'Sesame' }
];

const intoleranceOptions = [
  { value: 'lactose', label: 'Lactose' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'nightshades', label: 'Nightshades' },
  { value: 'high-fodmap', label: 'High FODMAP' },
  { value: 'caffeine', label: 'Caffeine' },
  { value: 'none', label: 'None' }
];

const cuisineOptions = [
  { value: 'indian', label: 'Indian' },
  { value: 'italian', label: 'Italian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'thai', label: 'Thai' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'middle-eastern', label: 'Middle Eastern' },
  { value: 'american', label: 'American' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'korean', label: 'Korean' },
  { value: 'vietnamese', label: 'Vietnamese' }
];

const spiceToleranceOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const mealPatternOptions = [
  { value: '3-meals', label: '3 meals' },
  { value: '2-meals', label: '2 meals' },
  { value: 'if-fasting', label: 'IF (fasting)' },
  { value: 'snacks-often', label: 'Snacks often' },
  { value: 'late-dinners', label: 'Late dinners' }
];

const beverageOptions = [
  { value: 'tea', label: 'Tea' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'juice', label: 'Juice' },
  { value: 'soda', label: 'Soda' },
  { value: 'energy-drinks', label: 'Energy drinks' },
  { value: 'none', label: 'None' }
];

export default function FoodPreferencesForm() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<FoodPreferencesData>>({
    allergens: {},
    showInQR: false
  });
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [allergenSeverity, setAllergenSeverity] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const existingData = await getFoodPreferencesData(user.uid);
          if (existingData) {
            setFormData(existingData);
            // Reconstruct allergen selection state from saved data
            if (existingData.allergens) {
              const allergenList = Object.keys(existingData.allergens);
              const severityMap: Record<string, string> = {};
              allergenList.forEach(allergen => {
                severityMap[allergen] = existingData.allergens![allergen];
              });
              setSelectedAllergens(allergenList);
              setAllergenSeverity(severityMap);
            }
          }
        } catch (error) {
          console.error('Error loading food preferences data:', error);
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
      // Combine allergen selections with severity levels
      const allergenData: Record<string, 'mild' | 'severe' | 'avoid-cross-contact'> = {};
      selectedAllergens.forEach(allergen => {
        allergenData[allergen] = (allergenSeverity[allergen] || 'mild') as 'mild' | 'severe' | 'avoid-cross-contact';
      });

      const finalData = {
        ...formData,
        allergens: allergenData
      };

      await saveFoodPreferencesData(user.uid, finalData);
      await refreshProfile(); // Update the profile completion status
      
      alert('Food preferences saved successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error saving food preferences data:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  const updateField = (field: keyof FoodPreferencesData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAllergenChange = (allergens: string[]) => {
    setSelectedAllergens(allergens);
    
    // Clean up severity data for removed allergens
    const newSeverity = { ...allergenSeverity };
    Object.keys(newSeverity).forEach(allergen => {
      if (!allergens.includes(allergen)) {
        delete newSeverity[allergen];
      }
    });
    setAllergenSeverity(newSeverity);
  };

  const updateAllergenSeverity = (allergen: string, severity: string) => {
    setAllergenSeverity(prev => ({
      ...prev,
      [allergen]: severity
    }));
  };

  const hasSevereAllergens = selectedAllergens.some(allergen => 
    allergenSeverity[allergen] === 'severe' || allergenSeverity[allergen] === 'avoid-cross-contact'
  );

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
          <h1 className="text-h3 font-semibold">Food & Allergies</h1>
          <div className="w-9" /> {/* Spacer for center alignment */}
        </div>
      </header>

      {/* Form Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <p className="text-small text-g600 mb-4">
            Allergens mark karna health ke liye zaroori ho sakta hai.
          </p>
        </div>

        <div className="space-y-6">
          {/* Diet Type */}
          <div>
            <Segmented
              label="Diet type"
              options={dietTypeOptions}
              value={formData.dietType || ''}
              onChange={(value) => updateField('dietType', value)}
            />
          </div>

          {/* Allergies - Big 9 */}
          <div>
            <Chips
              label="Allergies (Big-9)"
              options={allergenOptions}
              value={selectedAllergens}
              onChange={handleAllergenChange}
              helper="Select all that apply"
            />

            {/* Severity levels for selected allergens */}
            {selectedAllergens.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-meta font-medium">Severity levels:</p>
                {selectedAllergens.map(allergen => (
                  <div key={allergen} className="bg-g200 p-3 rounded-lg">
                    <Segmented
                      label={allergenOptions.find(opt => opt.value === allergen)?.label}
                      options={[
                        { value: 'mild', label: 'Mild' },
                        { value: 'severe', label: 'Severe' },
                        { value: 'avoid-cross-contact', label: 'Avoid cross-contact' }
                      ]}
                      value={allergenSeverity[allergen] || 'mild'}
                      onChange={(value) => updateAllergenSeverity(allergen, value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {hasSevereAllergens && (
              <div className="mt-3 p-3 bg-g200 rounded-lg">
                <p className="text-tiny text-g700 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Severe allergies will be prominently displayed when your QR is scanned.
                </p>
              </div>
            )}
          </div>

          {/* Intolerances */}
          <div>
            <Chips
              label="Intolerances/Sensitivities"
              options={intoleranceOptions}
              value={formData.intolerances || []}
              onChange={(value) => updateField('intolerances', value)}
            />
          </div>

          {/* Cuisine Likes */}
          <div>
            <Chips
              label="Cuisine likes"
              options={cuisineOptions}
              value={formData.cuisineLikes || []}
              onChange={(value) => updateField('cuisineLikes', value)}
            />
          </div>

          {/* Cuisine Avoids */}
          <div>
            <Chips
              label="Cuisine avoids"
              options={cuisineOptions}
              value={formData.cuisineAvoids || []}
              onChange={(value) => updateField('cuisineAvoids', value)}
            />
          </div>

          {/* Spice Tolerance */}
          <div>
            <Segmented
              label="Spice tolerance"
              options={spiceToleranceOptions}
              value={formData.spiceTolerance || ''}
              onChange={(value) => updateField('spiceTolerance', value as 'low' | 'medium' | 'high')}
            />
          </div>

          {/* Taste Preferences */}
          <div className="space-y-4">
            <div>
              <label className="block text-meta mb-2">Sweet preference (0-10)</label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={formData.sweetPreference || 5}
                onChange={(e) => updateField('sweetPreference', parseInt(e.target.value))}
                className="w-full h-2 bg-g300 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-tiny text-g500 mt-1">
                <span>Low</span>
                <span className="font-medium text-g700">{formData.sweetPreference || 5}</span>
                <span>High</span>
              </div>
            </div>

            <div>
              <label className="block text-meta mb-2">Salt comfort (0-10)</label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={formData.saltComfort || 5}
                onChange={(e) => updateField('saltComfort', parseInt(e.target.value))}
                className="w-full h-2 bg-g300 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-tiny text-g500 mt-1">
                <span>Low</span>
                <span className="font-medium text-g700">{formData.saltComfort || 5}</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Meal Patterns */}
          <div>
            <Chips
              label="Meal pattern"
              options={mealPatternOptions}
              value={formData.mealPatterns || []}
              onChange={(value) => updateField('mealPatterns', value)}
            />
          </div>

          {/* Beverages */}
          <div>
            <Chips
              label="Non-alcoholic beverages"
              options={beverageOptions}
              value={formData.beverages || []}
              onChange={(value) => updateField('beverages', value)}
            />
          </div>

          {/* Food Notes */}
          <div>
            <label className="block text-meta mb-2">Food notes (optional)</label>
            <textarea
              value={formData.foodNotes || ''}
              onChange={(e) => updateField('foodNotes', e.target.value)}
              placeholder="e.g., No onion/garlic, prefer grilled"
              maxLength={120}
              rows={3}
              className="input resize-none"
            />
            <p className="text-tiny text-g500 mt-1">
              {(formData.foodNotes || '').length}/120 characters
            </p>
          </div>

          {/* Sharing Controls */}
          <div>
            <Toggle
              label="Show in QR"
              checked={formData.showInQR || false}
              onChange={(checked) => updateField('showInQR', checked)}
              helper="Share diet type and allergies when QR is scanned"
            />
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
            Food preferences help others accommodate your dietary needs safely.
          </p>
        </div>
      </div>
    </div>
  );
}
