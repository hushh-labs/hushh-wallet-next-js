'use client';

import { useState, useEffect } from 'react';
import { PreferenceChip } from './PreferenceChip';
import { TastePayload, PREFERENCE_GROUPS, PreferenceState } from '@/types';

interface PreferenceSelectorProps {
  onGenerate: (preferences: TastePayload) => void;
  isGenerating: boolean;
}

export function PreferenceSelector({ onGenerate, isGenerating }: PreferenceSelectorProps) {
  const [preferences, setPreferences] = useState<PreferenceState>({
    foodType: [],
    spice: [],
    cuisines: [],
    brands: [],
    lifestyle: []
  });

  const [totalSelected, setTotalSelected] = useState(0);
  const [isValid, setIsValid] = useState(false);
  const [hasEnabledCTA, setHasEnabledCTA] = useState(false);

  // Calculate totals and validation
  useEffect(() => {
    const total = Object.values(preferences).reduce((sum, arr) => sum + arr.length, 0);
    setTotalSelected(total);

    const valid = total === 5 && 
                 preferences.foodType.length === 1 && 
                 preferences.spice.length === 1;
    setIsValid(valid);

    // Track when CTA first becomes enabled
    if (valid && !hasEnabledCTA) {
      setHasEnabledCTA(true);
      // Analytics: cta_enabled
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'cta_enabled', {
          event_category: 'preference_selection'
        });
      }
    }
  }, [preferences, hasEnabledCTA]);

  const handlePreferenceToggle = (groupId: string, option: string) => {
    const group = PREFERENCE_GROUPS.find(g => g.id === groupId);
    if (!group) return;

    setPreferences(prev => {
      const currentSelections = prev[groupId] || [];
      const isSelected = currentSelections.includes(option);
      
      let newSelections: string[];
      
      if (isSelected) {
        // Remove selection
        newSelections = currentSelections.filter(item => item !== option);
        
        // Analytics: pref_deselect
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'pref_deselect', {
            event_category: 'preference_selection',
            group: groupId,
            value: option
          });
        }
      } else {
        // Add selection
        if (group.maxSelections === 1) {
          // Single selection group - replace
          newSelections = [option];
        } else {
          // Multi selection group - add if under limit
          if (currentSelections.length < group.maxSelections) {
            newSelections = [...currentSelections, option];
          } else {
            // At limit, don't add
            return prev;
          }
        }
        
        // Analytics: pref_select
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'pref_select', {
            event_category: 'preference_selection',
            group: groupId,
            value: option
          });
        }
      }

      return {
        ...prev,
        [groupId]: newSelections
      };
    });
  };

  const handleGenerate = () => {
    if (!isValid) return;

    // Analytics: generate_click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'generate_click', {
        event_category: 'pass_generation'
      });
    }

    const payload: TastePayload = {
      foodType: preferences.foodType[0] as TastePayload['foodType'],
      spice: preferences.spice[0] as TastePayload['spice'],
      cuisines: preferences.cuisines,
      brands: preferences.brands,
      lifestyle: preferences.lifestyle
    };

    onGenerate(payload);
  };

  const getValidationMessage = () => {
    if (totalSelected === 0) {
      return "Pick exactly 5 preferences (Food Type + Spice required)";
    }
    
    if (preferences.foodType.length === 0) {
      return "Food Type is required";
    }
    
    if (preferences.spice.length === 0) {
      return "Spice level is required";
    }
    
    if (totalSelected < 5) {
      return `Pick ${5 - totalSelected} more preference${5 - totalSelected === 1 ? '' : 's'}`;
    }
    
    if (totalSelected > 5) {
      return `Remove ${totalSelected - 5} preference${totalSelected - 5 === 1 ? '' : 's'}`;
    }
    
    return "Perfect! Ready to generate your card.";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Counter */}
      <div className="text-center">
        <div className="text-2xl font-bold text-ink">
          {totalSelected}/5 selected
        </div>
        <p className={`text-sm mt-2 ${isValid ? 'text-green-600' : 'text-muted'}`}>
          {getValidationMessage()}
        </p>
      </div>

      {/* Preference Groups */}
      <div className="space-y-8">
        {PREFERENCE_GROUPS.map((group) => (
          <div key={group.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">
                {group.label}
                {group.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <div className="text-sm text-muted">
                {preferences[group.id]?.length || 0} / {group.maxSelections}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {group.options.map((option) => {
                const isSelected = preferences[group.id]?.includes(option) || false;
                const currentCount = preferences[group.id]?.length || 0;
                const isDisabled = !isSelected && currentCount >= group.maxSelections;
                
                return (
                  <PreferenceChip
                    key={`${group.id}-${option}`}
                    label={option}
                    selected={isSelected}
                    onToggle={() => handlePreferenceToggle(group.id, option)}
                    disabled={isDisabled}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <div className="text-center pt-8">
        <button
          type="button"
          className="btn-primary"
          onClick={handleGenerate}
          disabled={!isValid || isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Add to Apple Wallet'}
        </button>
        
        <p className="text-xs text-muted mt-3">
          Works on iPhone with Apple Wallet.
        </p>
      </div>
    </div>
  );
}
