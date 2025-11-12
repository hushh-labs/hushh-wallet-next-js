'use client';

import { useState, useEffect } from 'react';
import { HushhCardPayload } from '@/types';
import { PreferenceChip } from '@/components/PreferenceChip';

enum AppState {
  HERO = 'hero',
  PERSONAL = 'personal',
  FOOD = 'food',
  PREVIEW = 'preview',
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error'
}

export default function CreateHushhCard() {
  const [appState, setAppState] = useState<AppState>(AppState.HERO);
  const [isIOS, setIsIOS] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recoveryPhrase, setRecoveryPhrase] = useState<string[]>([]);
  const [cardData, setCardData] = useState<Partial<HushhCardPayload>>({});

  // Device detection
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
  }, []);

  const handleGetStarted = () => {
    setAppState(AppState.PERSONAL);
  };

  const handlePersonalSubmit = (personalData: Partial<HushhCardPayload>) => {
    setCardData(prev => ({ ...prev, ...personalData }));
    setAppState(AppState.FOOD);
  };

  const handleFoodSubmit = (foodData: Partial<HushhCardPayload>) => {
    const completeData = { ...cardData, ...foodData };
    setCardData(completeData);
    setAppState(AppState.PREVIEW);
  };

  const handleCreateCard = async () => {
    if (!isValidCardData(cardData)) {
      setErrorMessage('Please complete all required fields');
      return;
    }

    setAppState(AppState.GENERATING);
    setErrorMessage('');

    try {
      const response = await fetch('/api/cards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create card');
      }

      const result = await response.json();
      setRecoveryPhrase(result.data.recoveryPhrase.words);
      setAppState(AppState.SUCCESS);

      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'hushh_card_created', {
          event_category: 'card_creation',
          card_type: 'unified'
        });
      }

    } catch (error) {
      console.error('Card creation error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create card');
      setAppState(AppState.ERROR);
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = '/';
  };

  const handleEditPersonal = () => {
    setAppState(AppState.PERSONAL);
  };

  const handleEditFood = () => {
    setAppState(AppState.FOOD);
  };

  const isValidCardData = (data: Partial<HushhCardPayload>): data is HushhCardPayload => {
    return !!(
      data.legalName && 
      data.preferredName && 
      data.phone && 
      data.dob && 
      data.foodType && 
      data.spiceLevel &&
      Array.isArray(data.cuisines) &&
      Array.isArray(data.dishes) &&
      Array.isArray(data.exclusions)
    );
  };

  // Hero Section
  if (appState === AppState.HERO) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#14191E]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <p className="text-[#FFD700] text-sm font-medium tracking-wide uppercase">One Card. Complete Identity.</p>
              <h1 className="text-4xl md:text-6xl font-bold text-[#F8F5EB]">
                Create Your <span className="text-[#FFD700]">hushh</span> ID Card
              </h1>
            </div>
            
            <p className="text-xl text-[#B8860B] max-w-3xl mx-auto leading-relaxed">
              Your complete identity and food preferences in one elegant, privacy-first card for 
              <strong className="text-[#FFD700]"> Apple Wallet</strong>.
            </p>

            <div className="pt-6">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-[#FFD700] text-[#14191E] rounded-lg font-semibold text-lg hover:bg-[#E6C200] transition-colors shadow-lg"
              >
                Get Started
              </button>
            </div>

            <p className="text-sm text-[#666]">
              Works on iPhone with Apple Wallet • No login required
            </p>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-2 text-[#B8860B] hover:text-[#FFD700] transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Personal Info Section
  if (appState === AppState.PERSONAL) {
    return (
      <PersonalInfoForm
        initialData={cardData}
        onSubmit={handlePersonalSubmit}
        onBack={() => setAppState(AppState.HERO)}
        isLoading={false}
      />
    );
  }

  // Food Preferences Section
  if (appState === AppState.FOOD) {
    return (
      <FoodPreferencesForm
        initialData={cardData}
        onSubmit={handleFoodSubmit}
        onBack={() => setAppState(AppState.PERSONAL)}
        isLoading={false}
      />
    );
  }

  // Preview Section
  if (appState === AppState.PREVIEW) {
    return (
      <PreviewSection
        cardData={cardData as HushhCardPayload}
        onCreateCard={handleCreateCard}
        onEditPersonal={handleEditPersonal}
        onEditFood={handleEditFood}
        isGenerating={false}
      />
    );
  }

  // Generating Section
  if (appState === AppState.GENERATING) {
    return (
      <PreviewSection
        cardData={cardData as HushhCardPayload}
        onCreateCard={handleCreateCard}
        onEditPersonal={handleEditPersonal}
        onEditFood={handleEditFood}
        isGenerating={true}
      />
    );
  }

  // Success Section
  if (appState === AppState.SUCCESS) {
    return (
      <SuccessSection
        recoveryPhrase={recoveryPhrase}
        onBackToDashboard={handleBackToDashboard}
        isIOS={isIOS}
      />
    );
  }

  // Error Section
  if (appState === AppState.ERROR) {
    return (
      <ErrorSection
        errorMessage={errorMessage}
        onRetry={() => setAppState(AppState.PREVIEW)}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  return null;
}

// Personal Info Form Component
function PersonalInfoForm({ 
  initialData, 
  onSubmit, 
  onBack, 
  isLoading 
}: {
  initialData: Partial<HushhCardPayload>;
  onSubmit: (data: Partial<HushhCardPayload>) => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    gender: initialData.gender as HushhCardPayload['gender'] || undefined,
    legalName: initialData.legalName || '',
    preferredName: initialData.preferredName || '',
    phone: initialData.phone || '',
    dob: initialData.dob || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.legalName) newErrors.legalName = 'Legal name is required';
    if (!formData.preferredName) newErrors.preferredName = 'Preferred name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#14191E]">
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12 space-y-6">
            <p className="text-[#FFD700] text-sm font-medium tracking-wide uppercase">Step 1 of 2</p>
            <h1 className="text-4xl font-bold text-[#F8F5EB]">
              Personal <span className="text-[#FFD700]">Information</span>
            </h1>
            <p className="text-[#B8860B] max-w-2xl mx-auto">
              This information helps create your identity card. Your phone and DOB are never shown on the card face.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Gender - Optional */}
            <div>
              <label className="block text-[#F8F5EB] font-medium mb-3">
                How do you identify? <span className="text-[#666] font-normal">(optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female', 'other', 'prefer_not_to_say'] as const).map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: option }))}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.gender === option
                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                        : 'border-[#2A3038] bg-[#1A1F25] text-[#B8860B] hover:border-[#FFD700]/50'
                    }`}
                  >
                    {option.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Legal Name */}
            <div>
              <label className="block text-[#F8F5EB] font-medium mb-3">
                Legal name (as per ID) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.legalName}
                onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
                className="w-full p-4 rounded-lg bg-[#1A1F25] border border-[#2A3038] text-[#F8F5EB] focus:border-[#FFD700] focus:outline-none"
                placeholder="Full legal name"
              />
              {errors.legalName && <p className="text-red-400 text-sm mt-2">{errors.legalName}</p>}
            </div>

            {/* Preferred Name */}
            <div>
              <label className="block text-[#F8F5EB] font-medium mb-3">
                What should we call you on the card? <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.preferredName}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredName: e.target.value }))}
                className="w-full p-4 rounded-lg bg-[#1A1F25] border border-[#2A3038] text-[#F8F5EB] focus:border-[#FFD700] focus:outline-none"
                placeholder="Preferred name"
              />
              {errors.preferredName && <p className="text-red-400 text-sm mt-2">{errors.preferredName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[#F8F5EB] font-medium mb-3">
                Your contact number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-4 rounded-lg bg-[#1A1F25] border border-[#2A3038] text-[#F8F5EB] focus:border-[#FFD700] focus:outline-none"
                placeholder="+91XXXXXXXXXX"
              />
              {errors.phone && <p className="text-red-400 text-sm mt-2">{errors.phone}</p>}
              <p className="text-[#666] text-sm mt-2">Include country code (e.g., +91). Never shown on card face.</p>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-[#F8F5EB] font-medium mb-3">
                Your birth date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                className="w-full p-4 rounded-lg bg-[#1A1F25] border border-[#2A3038] text-[#F8F5EB] focus:border-[#FFD700] focus:outline-none"
              />
              {errors.dob && <p className="text-red-400 text-sm mt-2">{errors.dob}</p>}
              <p className="text-[#666] text-sm mt-2">We only display your age on the card, not your full birth date.</p>
            </div>

            <div className="flex gap-4 pt-8">
              <button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                className="flex-1 py-4 px-6 bg-[#2A3038] text-[#F8F5EB] rounded-lg hover:bg-[#3A4048] transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-4 px-6 bg-[#FFD700] text-[#14191E] rounded-lg font-semibold hover:bg-[#E6C200] transition-colors disabled:opacity-50"
              >
                Continue to Food Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Food Preferences Form Component  
function FoodPreferencesForm({ 
  initialData, 
  onSubmit, 
  onBack, 
  isLoading 
}: {
  initialData: Partial<HushhCardPayload>;
  onSubmit: (data: Partial<HushhCardPayload>) => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    foodType: initialData.foodType as HushhCardPayload['foodType'] || 'omnivore',
    spiceLevel: initialData.spiceLevel as HushhCardPayload['spiceLevel'] || 'medium',
    cuisines: initialData.cuisines || [],
    dishes: initialData.dishes || [],
    exclusions: initialData.exclusions || []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.foodType) newErrors.foodType = 'Food type is required';
    if (!formData.spiceLevel) newErrors.spiceLevel = 'Spice level is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const handleArraySelection = (key: 'cuisines' | 'dishes' | 'exclusions', value: string, maxSelections: number) => {
    setFormData(prev => {
      const current = prev[key] || [];
      const isSelected = current.includes(value);
      
      if (isSelected) {
        return { ...prev, [key]: current.filter(item => item !== value) };
      } else if (current.length < maxSelections) {
        return { ...prev, [key]: [...current, value] };
      }
      
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-[#14191E]">
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12 space-y-6">
            <p className="text-[#FFD700] text-sm font-medium tracking-wide uppercase">Step 2 of 2</p>
            <h1 className="text-4xl font-bold text-[#F8F5EB]">
              Food <span className="text-[#FFD700]">Preferences</span>
            </h1>
            <p className="text-[#B8860B] max-w-2xl mx-auto">
              Help restaurants and hosts understand your dietary preferences and restrictions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Food Type */}
            <div>
              <label className="block text-[#F8F5EB] font-medium mb-3">
                Food Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['omnivore', 'pescatarian', 'vegetarian', 'vegan', 'jain', 'eggitarian'] as const).map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, foodType: option }))}
                    className={`p-3 rounded-lg border transition-colors text-sm ${
                      formData.foodType === option
                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                        : 'border-[#2A3038] bg-[#1A1F25] text-[#B8860B] hover:border-[#FFD700]/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.foodType && <p className="text-red-400 text-sm mt-2">{errors.foodType}</p>}
            </div>

            {/* Spice Level */}
            <div>
              <label className="block text-[#F8F5EB] font-medium mb-3">
                Spice Level <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-5 gap-3">
                {(['no', 'mild', 'medium', 'hot', 'extra_hot'] as const).map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, spiceLevel: option }))}
                    className={`p-3 rounded-lg border transition-colors text-sm ${
                      formData.spiceLevel === option
                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                        : 'border-[#2A3038] bg-[#1A1F25] text-[#B8860B] hover:border-[#FFD700]/50'
                    }`}
                  >
                    {option.replace('_', ' ')}
                  </button>
                ))}
              </div>
              {errors.spiceLevel && <p className="text-red-400 text-sm mt-2">{errors.spiceLevel}</p>}
            </div>

            {/* Top Cuisines */}
            <div>
              <label className="block text-[#F8F5EB] font-medium mb-3">
                Favorite Cuisines <span className="text-[#666]">(up to 3)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Indian", "Italian", "Pan-Asian", "Chinese", "Japanese", "Korean", "Thai", 
                  "Mediterranean", "Mexican", "Middle-Eastern", "American", "Continental", 
                  "French", "Spanish", "Greek", "Lebanese", "Vietnamese", "Burmese", 
                  "African", "Turkish", "Persian", "Fusion"].map(cuisine => (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => handleArraySelection('cuisines', cuisine, 3)}
                    disabled={!formData.cuisines?.includes(cuisine) && (formData.cuisines?.length || 0) >= 3}
                    className={`p-2 rounded-lg border transition-colors text-sm ${
                      formData.cuisines?.includes(cuisine)
                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                        : 'border-[#2A3038] bg-[#1A1F25] text-[#B8860B] hover:border-[#FFD700]/50 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
              <p className="text-[#666] text-sm mt-2">{formData.cuisines?.length || 0}/3 selected</p>
            </div>

            {/* Dish Styles */}
            <div>
              <label className="block text-[#F8F5EB] font-medium mb-3">
                Dish Styles <span className="text-[#666]">(up to 3)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["bowls", "grills", "curries", "baked", "salads", "soups", "stir-fries", 
                  "noodles", "rice-based", "sandwiches", "wraps", "barbecue", "pasta", "dessert"].map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => handleArraySelection('dishes', style, 3)}
                    disabled={!formData.dishes?.includes(style) && (formData.dishes?.length || 0) >= 3}
                    className={`p-2 rounded-lg border transition-colors text-sm ${
                      formData.dishes?.includes(style)
                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                        : 'border-[#2A3038] bg-[#1A1F25] text-[#B8860B] hover:border-[#FFD700]/50 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
              <p className="text-[#666] text-sm mt-2">{formData.dishes?.length || 0}/3 selected</p>
            </div>

            {/* Dietary Exclusions */}
            <div>
              <label className="block text-[#F8F5EB] font-medium mb-3">
                Dietary Exclusions <span className="text-[#666]">(up to 2)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["gluten-free", "lactose-free", "eggless", "nut-free", "onion-garlic-free", 
                  "soy-free", "sugar-free", "low-salt", "keto"].map(exclusion => (
                  <button
                    key={exclusion}
                    type="button"
                    onClick={() => handleArraySelection('exclusions', exclusion, 2)}
                    disabled={!formData.exclusions?.includes(exclusion) && (formData.exclusions?.length || 0) >= 2}
                    className={`p-2 rounded-lg border transition-colors text-sm ${
                      formData.exclusions?.includes(exclusion)
                        ? 'border-red-400 bg-red-400/10 text-red-300'
                        : 'border-[#2A3038] bg-[#1A1F25] text-[#B8860B] hover:border-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {exclusion}
                  </button>
                ))}
              </div>
              <p className="text-[#666] text-sm mt-2">{formData.exclusions?.length || 0}/2 selected</p>
            </div>

            <div className="flex gap-4 pt-8">
              <button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                className="flex-1 py-4 px-6 bg-[#2A3038] text-[#F8F5EB] rounded-lg hover:bg-[#3A4048] transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-4 px-6 bg-[#FFD700] text-[#14191E] rounded-lg font-semibold hover:bg-[#E6C200] transition-colors disabled:opacity-50"
              >
                Review Card
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Preview Section
function PreviewSection({ 
  cardData, 
  onCreateCard, 
  onEditPersonal, 
  onEditFood, 
  isGenerating 
}: {
  cardData: HushhCardPayload;
  onCreateCard: () => void;
  onEditPersonal: () => void;
  onEditFood: () => void;
  isGenerating: boolean;
}) {
  const age = cardData.dob ? new Date().getFullYear() - new Date(cardData.dob).getFullYear() : 0;
  const maskedPhone = cardData.phone ? cardData.phone.replace(/(\+\d{2})\d+(\d{2})$/, '$1-••••-•••$2') : '';

  return (
    <div className="min-h-screen bg-[#14191E]">
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12 space-y-6">
            <p className="text-[#FFD700] text-sm font-medium tracking-wide uppercase">Review Your Card</p>
            <h1 className="text-4xl font-bold text-[#F8F5EB]">
              hushh ID Card <span className="text-[#FFD700]">Preview</span>
            </h1>
            <p className="text-[#B8860B]">
              Review your information before creating your card. This is how others will see your preferences.
            </p>
          </div>

          <div className="space-y-8">
            {/* Personal Info Preview */}
            <div className="bg-[#1A1F25] rounded-xl p-6 border border-[#2A3038]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#FFD700] font-semibold text-lg">Personal Information</h3>
                <button
                  onClick={onEditPersonal}
                  disabled={isGenerating}
                  className="text-[#B8860B] hover:text-[#FFD700] transition-colors disabled:opacity-50"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#B8860B]">Name on Card</span>
                  <span className="text-[#F8F5EB] font-medium">{cardData.preferredName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B8860B]">Age</span>
                  <span className="text-[#F8F5EB]">{age} years old</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B8860B]">Contact</span>
                  <span className="text-[#F8F5EB] font-mono">{maskedPhone}</span>
                </div>
                {cardData.gender && (
                  <div className="flex justify-between">
                    <span className="text-[#B8860B]">Gender</span>
                    <span className="text-[#F8F5EB] capitalize">{cardData.gender.replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Food Preferences Preview */}
            <div className="bg-[#1A1F25] rounded-xl p-6 border border-[#2A3038]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#FFD700] font-semibold text-lg">Food Preferences</h3>
                <button
                  onClick={onEditFood}
                  disabled={isGenerating}
                  className="text-[#B8860B] hover:text-[#FFD700] transition-colors disabled:opacity-50"
                >
                  Edit
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-full text-[#FFD700] text-sm capitalize">
                    {cardData.foodType}
                  </span>
                  <span className="px-3 py-1 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-full text-[#FFD700] text-sm capitalize">
                    {cardData.spiceLevel.replace('_', ' ')} spice
                  </span>
                </div>

                {cardData.cuisines?.length > 0 && (
                  <div>
                    <p className="text-[#B8860B] text-sm mb-2">Favorite Cuisines</p>
                    <div className="flex flex-wrap gap-2">
                      {cardData.cuisines.map((cuisine, index) => (
                        <span key={index} className="px-3 py-1 bg-[#2A3038] border border-[#3A4048] rounded-full text-[#F8F5EB] text-sm">
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {cardData.dishes?.length > 0 && (
                  <div>
                    <p className="text-[#B8860B] text-sm mb-2">Dish Styles</p>
                    <div className="flex flex-wrap gap-2">
                      {cardData.dishes.map((style, index) => (
                        <span key={index} className="px-3 py-1 bg-[#2A3038] border border-[#3A4048] rounded-full text-[#F8F5EB] text-sm">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {cardData.exclusions?.length > 0 && (
                  <div>
                    <p className="text-[#B8860B] text-sm mb-2">Dietary Exclusions</p>
                    <div className="flex flex-wrap gap-2">
                      {cardData.exclusions.map((exclusion, index) => (
                        <span key={index} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-300 text-sm">
                          {exclusion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={onCreateCard}
                disabled={isGenerating}
                className="w-full py-4 px-6 bg-[#FFD700] text-[#14191E] rounded-lg font-semibold text-lg hover:bg-[#E6C200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#14191E] border-t-transparent rounded-full animate-spin mr-3"></div>
                    Creating Your Card...
                  </>
                ) : (
                  'Create hushh ID Card'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Success Section
function SuccessSection({ 
  recoveryPhrase, 
  onBackToDashboard, 
  isIOS 
}: {
  recoveryPhrase: string[];
  onBackToDashboard: () => void;
  isIOS: boolean | null;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyPhrase = async () => {
    try {
      await navigator.clipboard.writeText(recoveryPhrase.join(' '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#14191E]">
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12 space-y-6">
            <div className="w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-[#14191E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-[#F8F5EB]">
              Your <span className="text-[#FFD700]">hushh</span> ID Card is Ready!
            </h1>
            <p className="text-[#B8860B]">
              Your card has been created successfully. Save your recovery phrase and add to Apple Wallet.
            </p>
          </div>

          <div className="space-y-8">
            {/* Recovery Phrase */}
            <div className="bg-[#1A1F25] rounded-xl p-6 border border-[#2A3038]">
              <h3 className="text-[#FFD700] font-semibold text-lg mb-4">
                🔐 Recovery Phrase (Save This!)
              </h3>
              <p className="text-[#B8860B] text-sm mb-4">
                This 12-word phrase can restore access to your card if you lose your device. Write it down and store it safely.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {recoveryPhrase.map((word, index) => (
                  <div key={index} className="bg-[#2A3038] p-3 rounded-lg border border-[#3A4048]">
                    <div className="text-xs text-[#666] mb-1">{index + 1}</div>
                    <div className="text-[#F8F5EB] font-medium">{word}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCopyPhrase}
                className="w-full py-3 bg-[#2A3038] text-[#F8F5EB] rounded-lg hover:bg-[#3A4048] transition-colors"
              >
                {copied ? '✅ Copied to Clipboard!' : '📋 Copy Recovery Phrase'}
              </button>
            </div>

            {/* Add to Wallet */}
            <div className="bg-[#1A1F25] rounded-xl p-6 border border-[#2A3038]">
              <h3 className="text-[#FFD700] font-semibold text-lg mb-4">
                📱 Add to Apple Wallet
              </h3>
              {isIOS ? (
                <div className="space-y-4">
                  <p className="text-[#B8860B] text-sm">
                    Your card is ready to be added to Apple Wallet. Tap the button below to add it.
                  </p>
                  <button
                    onClick={() => {
                      // This would trigger pass download in real implementation
                      alert('Pass download would start here');
                    }}
                    className="w-full py-4 bg-black text-white rounded-lg font-medium flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Add to Apple Wallet
                  </button>
                </div>
              ) : (
                <p className="text-[#B8860B] text-sm">
                  Open this page on an iPhone to add your card to Apple Wallet.
                </p>
              )}
            </div>

            <div className="pt-8">
              <button
                onClick={onBackToDashboard}
                className="w-full py-4 px-6 bg-[#2A3038] text-[#F8F5EB] rounded-lg hover:bg-[#3A4048] transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error Section
function ErrorSection({ 
  errorMessage, 
  onRetry, 
  onBackToDashboard 
}: {
  errorMessage: string;
  onRetry: () => void;
  onBackToDashboard: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#14191E]">
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12 space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-[#F8F5EB]">
              Card Creation <span className="text-red-400">Failed</span>
            </h1>
            <p className="text-red-400 max-w-md mx-auto">
              {errorMessage}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={onRetry}
              className="w-full py-4 px-6 bg-[#FFD700] text-[#14191E] rounded-lg font-semibold hover:bg-[#E6C200] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onBackToDashboard}
              className="w-full py-4 px-6 bg-[#2A3038] text-[#F8F5EB] rounded-lg hover:bg-[#3A4048] transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
