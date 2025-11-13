'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Segmented, Toggle } from '@/components/ui';
import { NetWorthData } from '@/types/hushh-id';
import { useAuth } from '@/contexts/AuthContext';
import { saveNetWorthData, getNetWorthData } from '@/lib/firestore';

const shareModeOptions = [
  { value: 'hide', label: 'Hide' },
  { value: 'band', label: 'Band only' },
  { value: 'exact', label: 'Exact' }
];

const bandOptions = [
  { value: '<10k', label: '<$10k' },
  { value: '10k-100k', label: '$10k–$100k' },
  { value: '100k-1M', label: '$100k–$1M' },
  { value: '1M-10M', label: '$1M–$10M' },
  { value: '10M+', label: '$10M+' }
];

export default function NetWorthForm() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<NetWorthData>>({
    shareMode: 'hide',
    isRangeData: false,
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const existingData = await getNetWorthData(user.uid);
          if (existingData) {
            setFormData(existingData);
          }
        } catch (error) {
          console.error('Error loading net worth data:', error);
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

  // Calculate totals whenever asset/liability fields change
  React.useEffect(() => {
    const assets = (formData.cashBank || 0) + 
                  (formData.investments || 0) + 
                  (formData.retirementAccounts || 0) + 
                  (formData.realEstateEquity || 0) + 
                  (formData.vehiclesEquity || 0) + 
                  (formData.otherAssets || 0);

    const liabilities = (formData.mortgageBalance || 0) + 
                       (formData.studentLoans || 0) + 
                       (formData.creditCardsPersonalLoans || 0) + 
                       (formData.otherLiabilities || 0);

    const netWorth = assets - liabilities;

    setFormData(prev => ({
      ...prev,
      totalAssets: assets,
      totalLiabilities: liabilities,
      netWorth: netWorth
    }));
  }, [
    formData.cashBank, formData.investments, formData.retirementAccounts,
    formData.realEstateEquity, formData.vehiclesEquity, formData.otherAssets,
    formData.mortgageBalance, formData.studentLoans, formData.creditCardsPersonalLoans,
    formData.otherLiabilities
  ]);

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save your data');
      return;
    }

    setIsSaving(true);
    try {
      await saveNetWorthData(user.uid, formData);
      await refreshProfile(); // Update the profile completion status
      
      alert('Net worth data saved successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error saving net worth data:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  const updateField = (field: keyof NetWorthData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
          <h1 className="text-h3 font-semibold">Net Worth (USD)</h1>
          <div className="w-9" /> {/* Spacer for center alignment */}
        </div>
      </header>

      {/* Form Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <p className="text-small text-g600 mb-4">
            Approx values fine. You can add precise later.
          </p>
        </div>

        <div className="space-y-8">
          {/* Assets Section */}
          <div>
            <h2 className="text-h3 font-semibold mb-4 text-g900">Assets</h2>
            <div className="space-y-4">
              <Input
                type="number"
                label="Cash & bank (USD)"
                placeholder="0"
                value={formData.cashBank || ''}
                onChange={(e) => updateField('cashBank', parseFloat(e.target.value) || 0)}
                helper="Checking, savings, cash"
              />

              <Input
                type="number"
                label="Investments – brokerage (USD)"
                placeholder="0"
                value={formData.investments || ''}
                onChange={(e) => updateField('investments', parseFloat(e.target.value) || 0)}
                helper="Stocks, ETFs, bonds (non-retirement)"
              />

              <Input
                type="number"
                label="Retirement accounts (USD)"
                placeholder="0"
                value={formData.retirementAccounts || ''}
                onChange={(e) => updateField('retirementAccounts', parseFloat(e.target.value) || 0)}
                helper="401k/IRA/Provident/PPF etc."
              />

              <Input
                type="number"
                label="Real estate equity (USD)"
                placeholder="0"
                value={formData.realEstateEquity || ''}
                onChange={(e) => updateField('realEstateEquity', parseFloat(e.target.value) || 0)}
                helper="Property value − mortgage balance"
              />

              <Input
                type="number"
                label="Vehicles equity (USD)"
                placeholder="0"
                value={formData.vehiclesEquity || ''}
                onChange={(e) => updateField('vehiclesEquity', parseFloat(e.target.value) || 0)}
                helper="Resale value − auto loans"
              />

              <Input
                type="number"
                label="Other assets (USD)"
                placeholder="0"
                value={formData.otherAssets || ''}
                onChange={(e) => updateField('otherAssets', parseFloat(e.target.value) || 0)}
                helper="Crypto, gold, art, collectibles"
              />
            </div>
          </div>

          {/* Liabilities Section */}
          <div>
            <h2 className="text-h3 font-semibold mb-4 text-g900">Liabilities</h2>
            <div className="space-y-4">
              <Input
                type="number"
                label="Mortgage balance (USD)"
                placeholder="0"
                value={formData.mortgageBalance || ''}
                onChange={(e) => updateField('mortgageBalance', parseFloat(e.target.value) || 0)}
              />

              <Input
                type="number"
                label="Student/Education loans (USD)"
                placeholder="0"
                value={formData.studentLoans || ''}
                onChange={(e) => updateField('studentLoans', parseFloat(e.target.value) || 0)}
              />

              <Input
                type="number"
                label="Credit cards & personal loans (USD)"
                placeholder="0"
                value={formData.creditCardsPersonalLoans || ''}
                onChange={(e) => updateField('creditCardsPersonalLoans', parseFloat(e.target.value) || 0)}
              />

              <Input
                type="number"
                label="Other liabilities (USD)"
                placeholder="0"
                value={formData.otherLiabilities || ''}
                onChange={(e) => updateField('otherLiabilities', parseFloat(e.target.value) || 0)}
                helper="Tax due, BNPL, margin, etc."
              />
            </div>
          </div>

          {/* Calculated Summary */}
          <div className="bg-g200 p-4 rounded-lg">
            <h3 className="text-small font-semibold mb-3 text-g900">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-g600">Total Assets:</span>
                <span className="font-medium text-g900">{formatCurrency(formData.totalAssets || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-g600">Total Liabilities:</span>
                <span className="font-medium text-g900">{formatCurrency(formData.totalLiabilities || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-g300 pt-2">
                <span className="font-semibold text-g900">Net Worth:</span>
                <span className="font-bold text-g900">{formatCurrency(formData.netWorth || 0)}</span>
              </div>
            </div>
            <p className="text-tiny text-g500 mt-2">
              Net worth updates automatically as you edit.
            </p>
          </div>

          {/* Sharing Controls */}
          <div>
            <h3 className="text-h3 font-semibold mb-4 text-g900">Sharing Settings</h3>
            <div className="space-y-4">
              <Segmented
                label="Share mode"
                options={shareModeOptions}
                value={formData.shareMode || 'hide'}
                onChange={(value) => updateField('shareMode', value as 'hide' | 'band' | 'exact')}
              />

              {formData.shareMode === 'band' && (
                <Segmented
                  label="Net worth band"
                  options={bandOptions}
                  value={formData.band || '<10k'}
                  onChange={(value) => updateField('band', value)}
                />
              )}

              <Toggle
                label="Use range estimates"
                checked={formData.isRangeData || false}
                onChange={(checked) => updateField('isRangeData', checked)}
                helper="Show approximate ranges instead of exact values"
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
            Your financial data is private by default. You control what is shared.
          </p>
        </div>
      </div>
    </div>
  );
}
