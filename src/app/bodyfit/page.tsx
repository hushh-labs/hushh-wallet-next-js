'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Segmented, Chips, Toggle } from '@/components/ui';
import { BodyFitData } from '@/types/hushh-id';
import { useAuth } from '@/contexts/AuthContext';
import { saveBodyFitData, getBodyFitData } from '@/lib/firestore';

const heightUnitOptions = [
  { value: 'cm', label: 'cm' },
  { value: 'ft-in', label: 'ft+in' }
];

const weightUnitOptions = [
  { value: 'kg', label: 'kg' },
  { value: 'lb', label: 'lb' }
];

const shoeSystemOptions = [
  { value: 'US', label: 'US' },
  { value: 'UK', label: 'UK' },
  { value: 'EU', label: 'EU' },
  { value: 'CM', label: 'CM' }
];

const shoeWidthOptions = [
  { value: 'N', label: 'N (Narrow)' },
  { value: 'M', label: 'M (Medium)' },
  { value: 'W', label: 'W (Wide)' },
  { value: 'E', label: 'E (Extra Wide)' }
];

const topSizeOptions = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: 'XXXL', label: 'XXXL' }
];

const fitPreferenceOptions = [
  { value: 'slim', label: 'Slim' },
  { value: 'regular', label: 'Regular' },
  { value: 'relaxed', label: 'Relaxed' }
];

const ringSizeSystemOptions = [
  { value: 'US', label: 'US scale' },
  { value: 'mm', label: 'Circumference (mm)' }
];

const waistUnitOptions = [
  { value: 'in', label: 'in' },
  { value: 'cm', label: 'cm' }
];

const visibilityFields = [
  { value: 'height', label: 'Height' },
  { value: 'shoe', label: 'Shoe' },
  { value: 'top-size', label: 'Top size' },
  { value: 'bottom-size', label: 'Bottom size' }
];

// Shoe size mappings (approximate)
const shoeSizeMappings = {
  'US': [
    { us: '6', uk: '5.5', eu: '39', cm: '24.0' },
    { us: '6.5', uk: '6', eu: '39.5', cm: '24.5' },
    { us: '7', uk: '6.5', eu: '40', cm: '25.0' },
    { us: '7.5', uk: '7', eu: '40.5', cm: '25.5' },
    { us: '8', uk: '7.5', eu: '41', cm: '26.0' },
    { us: '8.5', uk: '8', eu: '42', cm: '26.5' },
    { us: '9', uk: '8.5', eu: '42.5', cm: '27.0' },
    { us: '9.5', uk: '9', eu: '43', cm: '27.5' },
    { us: '10', uk: '9.5', eu: '44', cm: '28.0' },
    { us: '10.5', uk: '10', eu: '44.5', cm: '28.5' },
    { us: '11', uk: '10.5', eu: '45', cm: '29.0' },
    { us: '11.5', uk: '11', eu: '46', cm: '29.5' },
    { us: '12', uk: '11.5', eu: '47', cm: '30.0' }
  ]
};

export default function BodyFitForm() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<BodyFitData>>({
    heightUnit: 'cm',
    weightUnit: 'kg',
    shoeSystem: 'US',
    waistUnit: 'in',
    inseamUnit: 'in',
    ringSizeSystem: 'US',
    fieldsVisibleInQR: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const existingData = await getBodyFitData(user.uid);
          if (existingData) {
            setFormData(existingData);
          }
        } catch (error) {
          console.error('Error loading body fit data:', error);
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
      await saveBodyFitData(user.uid, formData);
      await refreshProfile(); // Update the profile completion status
      
      alert('Body & Fit data saved successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error saving body fit data:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  const updateField = (field: keyof BodyFitData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Convert height between cm and ft+in
  const convertHeight = (value: number, fromUnit: string): { feet: number; inches: number; cm: number } => {
    if (fromUnit === 'cm') {
      const totalInches = value / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round((totalInches % 12) * 10) / 10;
      return { feet, inches, cm: value };
    } else {
      // From ft+in
      const cm = Math.round((value * 2.54) * 10) / 10;
      return { feet: 0, inches: 0, cm };
    }
  };

  // Convert weight between kg and lb
  const convertWeight = (value: number, fromUnit: string): { kg: number; lb: number } => {
    if (fromUnit === 'kg') {
      return { kg: value, lb: Math.round(value * 2.20462 * 10) / 10 };
    } else {
      return { kg: Math.round(value / 2.20462 * 10) / 10, lb: value };
    }
  };

  // Get shoe size conversion
  const getShoeSizeConversion = (size: string, system: string) => {
    if (!size || !system) return '';
    const mapping = shoeSizeMappings.US.find(item => item[system.toLowerCase() as keyof typeof item] === size);
    if (!mapping) return '';
    
    const conversions = [];
    if (system !== 'US') conversions.push(`US: ${mapping.us}`);
    if (system !== 'UK') conversions.push(`UK: ${mapping.uk}`);
    if (system !== 'EU') conversions.push(`EU: ${mapping.eu}`);
    if (system !== 'CM') conversions.push(`CM: ${mapping.cm}`);
    
    return conversions.join(' • ');
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
          <h1 className="text-h3 font-semibold">Body & Fit</h1>
          <div className="w-9" /> {/* Spacer for center alignment */}
        </div>
      </header>

      {/* Form Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <p className="text-small text-g600 mb-4">
            Exact nahi? Approx bhi chalega.
          </p>
        </div>

        <div className="space-y-6">
          {/* Height */}
          <div>
            <div className="flex gap-3 mb-2">
              <div className="flex-1">
                <Input
                  type="number"
                  label="Height"
                  value={formData.height || ''}
                  onChange={(e) => updateField('height', parseFloat(e.target.value) || undefined)}
                  placeholder={formData.heightUnit === 'cm' ? '170' : '12'}
                />
              </div>
              <div className="w-20 pt-7">
                <Segmented
                  options={heightUnitOptions}
                  value={formData.heightUnit || 'cm'}
                  onChange={(value) => updateField('heightUnit', value as 'cm' | 'ft-in')}
                />
              </div>
            </div>
            {formData.height && (
              <p className="text-tiny text-g500">
                {formData.heightUnit === 'cm' 
                  ? `≈ ${convertHeight(formData.height, 'cm').feet}'${convertHeight(formData.height, 'cm').inches}"`
                  : `≈ ${Math.round(formData.height * 2.54)} cm`
                }
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <div className="flex gap-3 mb-2">
              <div className="flex-1">
                <Input
                  type="number"
                  label="Weight (optional)"
                  value={formData.weight || ''}
                  onChange={(e) => updateField('weight', parseFloat(e.target.value) || undefined)}
                  placeholder={formData.weightUnit === 'kg' ? '70' : '154'}
                  step="0.5"
                />
              </div>
              <div className="w-20 pt-7">
                <Segmented
                  options={weightUnitOptions}
                  value={formData.weightUnit || 'kg'}
                  onChange={(value) => updateField('weightUnit', value as 'kg' | 'lb')}
                />
              </div>
            </div>
            {formData.weight && (
              <p className="text-tiny text-g500">
                {formData.weightUnit === 'kg' 
                  ? `≈ ${convertWeight(formData.weight, 'kg').lb} lb`
                  : `≈ ${convertWeight(formData.weight, 'lb').kg} kg`
                }
              </p>
            )}
          </div>

          {/* Shoe Size */}
          <div>
            <div className="flex gap-3 mb-2">
              <div className="flex-1">
                <Input
                  label="Shoe size"
                  value={formData.shoeSize || ''}
                  onChange={(e) => updateField('shoeSize', parseFloat(e.target.value) || undefined)}
                  placeholder="9"
                />
              </div>
              <div className="w-16 pt-7">
                <Segmented
                  options={shoeSystemOptions}
                  value={formData.shoeSystem || 'US'}
                  onChange={(value) => updateField('shoeSystem', value as 'US' | 'UK' | 'EU' | 'CM')}
                />
              </div>
            </div>
            {formData.shoeSize && (
              <p className="text-tiny text-g500">
                {getShoeSizeConversion(formData.shoeSize.toString(), formData.shoeSystem || 'US')}
              </p>
            )}
            
            <div className="mt-3">
              <label className="block text-meta mb-2">Width (optional)</label>
              <select
                value={formData.shoeWidth || ''}
                onChange={(e) => updateField('shoeWidth', e.target.value)}
                className="input"
              >
                <option value="">Select width</option>
                {shoeWidthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Top Size */}
          <div>
            <Segmented
              label="Top size"
              options={topSizeOptions}
              value={formData.topSize || ''}
              onChange={(value) => updateField('topSize', value as 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL')}
            />
            
            <div className="mt-3">
              <Input
                type="number"
                label="Chest measurement (optional, cm)"
                value={formData.chestMeasurement || ''}
                onChange={(e) => updateField('chestMeasurement', parseFloat(e.target.value) || undefined)}
                placeholder="96"
              />
            </div>
          </div>

          {/* Bottom Size */}
          <div>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <Input
                  type="number"
                  label="Waist"
                  value={formData.waist || ''}
                  onChange={(e) => updateField('waist', parseFloat(e.target.value) || undefined)}
                  placeholder={formData.waistUnit === 'in' ? '32' : '81'}
                />
              </div>
              <div className="w-16 pt-7">
                <Segmented
                  options={waistUnitOptions}
                  value={formData.waistUnit || 'in'}
                  onChange={(value) => updateField('waistUnit', value as 'in' | 'cm')}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  label="Inseam"
                  value={formData.inseam || ''}
                  onChange={(e) => updateField('inseam', parseFloat(e.target.value) || undefined)}
                  placeholder={formData.inseamUnit === 'in' ? '32' : '81'}
                />
              </div>
              <div className="w-16 pt-7">
                <Segmented
                  options={waistUnitOptions}
                  value={formData.inseamUnit || 'in'}
                  onChange={(value) => updateField('inseamUnit', value as 'in' | 'cm')}
                />
              </div>
            </div>
          </div>

          {/* Ring Size */}
          <div>
            <div className="flex gap-3 mb-2">
              <div className="flex-1">
                <Input
                  type="number"
                  label="Ring size (optional)"
                  value={formData.ringSize || ''}
                  onChange={(e) => updateField('ringSize', parseFloat(e.target.value) || undefined)}
                  placeholder={formData.ringSizeSystem === 'US' ? '7' : '54'}
                />
              </div>
              <div className="w-20 pt-7">
                <Segmented
                  options={ringSizeSystemOptions}
                  value={formData.ringSizeSystem || 'US'}
                  onChange={(value) => updateField('ringSizeSystem', value as 'US' | 'mm')}
                />
              </div>
            </div>
          </div>

          {/* Wrist Circumference */}
          <div>
            <Input
              type="number"
              label="Wrist circumference (optional, cm)"
              value={formData.wristCircumference || ''}
              onChange={(e) => updateField('wristCircumference', parseFloat(e.target.value) || undefined)}
              placeholder="17"
              helper="For watch strap sizing"
            />
          </div>

          {/* Fit Preference */}
          <div>
            <Segmented
              label="Fit preference"
              options={fitPreferenceOptions}
              value={formData.fitPreference || ''}
              onChange={(value) => updateField('fitPreference', value as 'slim' | 'regular' | 'relaxed')}
            />
          </div>

          {/* Body Notes */}
          <div>
            <label className="block text-meta mb-2">Body notes (optional)</label>
            <textarea
              value={formData.bodyNotes || ''}
              onChange={(e) => updateField('bodyNotes', e.target.value)}
              placeholder="e.g., broad shoulders, long arms"
              maxLength={100}
              rows={3}
              className="input resize-none"
            />
            <p className="text-tiny text-g500 mt-1">
              {(formData.bodyNotes || '').length}/100 characters
            </p>
          </div>

          {/* Sharing Controls */}
          <div>
            <h3 className="text-h3 font-semibold mb-4 text-g900">Sharing Settings</h3>
            <Chips
              label="Fields visible in QR"
              options={visibilityFields}
              value={formData.fieldsVisibleInQR || []}
              onChange={(value) => updateField('fieldsVisibleInQR', value)}
              helper="Choose which measurements to share when QR is scanned"
            />
            <p className="text-tiny text-g500 mt-2">
              Default: All fields are private
            </p>
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
            Size information helps with clothing and accessory recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
