'use client';

import { useState, useEffect } from 'react';
import { PreferenceSelector } from '@/components/PreferenceSelector';
import { TastePayload } from '@/types';

enum AppState {
  HERO = 'hero',
  PREFERENCES = 'preferences',
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error'
}

export default function FoodCardPage() {
  const [appState, setAppState] = useState<AppState>(AppState.HERO);
  const [isIOS, setIsIOS] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [generatedURL, setGeneratedURL] = useState<string>('');

  // Device detection
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Analytics: device detection
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', isIOSDevice ? 'ios_detected' : 'android_detected', {
        event_category: 'device_detection'
      });
    }
  }, []);

  const handleGetStarted = () => {
    setAppState(AppState.PREFERENCES);
  };

  const handleGenerate = async (preferences: TastePayload) => {
    setAppState(AppState.GENERATING);
    setErrorMessage('');

    try {
      // Send food preferences to unified backend
      const response = await fetch('/api/cards/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'food',
          data: {
            foodType: preferences.foodType,
            spiceLevel: preferences.spice,
            cuisines: preferences.cuisines || [],
            dishes: preferences.dishes || [],
            exclusions: preferences.exclusions || []
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save food preferences');
      }

      const result = await response.json();

      // Analytics: food_data_saved
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'food_data_saved', {
          event_category: 'unified_card_creation',
          is_complete: result.data.isComplete
        });
      }

      if (result.data.isComplete && result.data.hasPass) {
        // Complete card available - show success with pass download
        setGeneratedURL(result.data.shareUrl);
        // Store UID for pass download
        sessionStorage.setItem('hushh_uid', result.data.uid);

        // Analytics: unified_card_generated
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'unified_card_generated', {
            event_category: 'pass_generation'
          });
        }

        setAppState(AppState.SUCCESS);
      } else {
        // Partial data saved - redirect to personal or dashboard
        if (result.data.isComplete) {
          // Both sections complete but pass generation failed
          setGeneratedURL(result.data.shareUrl);
          sessionStorage.setItem('hushh_uid', result.data.uid);
          setAppState(AppState.SUCCESS);
        } else {
          // Need to complete personal section
          window.location.href = '/cards/personal';
        }
      }

    } catch (error) {
      console.error('Save error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save food preferences');
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.HERO);
    setErrorMessage('');
    setGeneratedURL('');
  };

  const handleEmailLink = () => {
    const subject = encodeURIComponent('Your Hushh Unified ID Card');
    const body = encodeURIComponent(`Here's your Hushh unified ID card: ${generatedURL}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleDownloadPass = async () => {
    try {
      const uid = sessionStorage.getItem('hushh_uid');
      if (!uid) {
        throw new Error('User ID not found');
      }

      const response = await fetch(`/api/cards/download/${uid}`);
      
      if (!response.ok) {
        throw new Error('Failed to download pass');
      }

      // Download the pass file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hushh-id-card.pkpass';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Analytics: pass_downloaded
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'unified_pass_downloaded', {
          event_category: 'pass_generation'
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download pass. Please try again.');
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {appState === AppState.HERO && (
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <div className="container-narrow">
            <div className="text-center space-y-8 fade-in">
              <div className="space-y-6">
                <p className="text-eyebrow">Food, simplified</p>
                <h1 className="text-hero text-ink">
                  Build your <span className="font-black">Hushh Food Preference Card</span>
                </h1>
              </div>
              
              <p className="text-deck text-muted max-w-3xl mx-auto">
                Pick five food preferences and add a clean, luxury card to <strong className="text-ink">Apple Wallet</strong>.
              </p>

              <div className="pt-6">
                <button
                  onClick={handleGetStarted}
                  className="btn-primary hover-lift"
                >
                  Get Started
                </button>
              </div>

              <p className="text-sm text-muted">
                Works on iPhone with Apple Wallet.
              </p>
            </div>

            {/* Back to Dashboard */}
            <div className="text-center mt-12">
              <button
                onClick={handleBackToDashboard}
                className="btn-secondary"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Section */}
      {(appState === AppState.PREFERENCES || appState === AppState.GENERATING) && (
        <div className="min-h-screen section-padding bg-paper">
          <div className="container-wide">
            {/* Header */}
            <div className="text-center mb-16 space-y-6 fade-in">
              <p className="text-eyebrow">Choose Your Preferences</p>
              <h1 className="text-hero text-ink">
                Pick exactly <span className="font-black">5 preferences</span>
              </h1>
              <p className="text-deck text-muted max-w-3xl mx-auto">
                Select exactly 5 preferences to create your personalized food preference card. 
                <strong className="text-ink">Food type</strong> and <strong className="text-ink">spice level</strong> are required.
              </p>
            </div>

            {/* Preference Selector */}
            <div className={`${appState === AppState.GENERATING ? 'loading' : ''}`}>
              <PreferenceSelector 
                onGenerate={handleGenerate}
                isGenerating={appState === AppState.GENERATING}
              />
            </div>

            {/* Back Link */}
            <div className="text-center mt-12">
              <button
                onClick={handleReset}
                className="btn-secondary"
                disabled={appState === AppState.GENERATING}
              >
                ← Back to Card Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success State (Non-iOS) */}
      {appState === AppState.SUCCESS && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md mx-auto px-6 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-ink">Unified Card Complete!</h2>
              <p className="text-muted">
                {isIOS === false 
                  ? "Apple Wallet is iPhone-only. Email the link to yourself to open on your iPhone."
                  : "Your unified hushh ID card is ready with personal & food preferences."
                }
              </p>
            </div>

            <div className="space-y-3">
              {generatedURL && (
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadPass}
                    className="btn-primary w-full"
                  >
                    📱 Add to Apple Wallet
                  </button>

                  <a
                    href={generatedURL}
                    className="btn-secondary w-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 View Public Profile
                  </a>
                  
                  <button
                    onClick={handleEmailLink}
                    className="btn-secondary"
                  >
                    Email me the link
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleBackToDashboard}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {appState === AppState.ERROR && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md mx-auto px-6 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-ink">Something went wrong</h2>
              <p className="text-muted">{errorMessage}</p>
            </div>

            <button
              onClick={() => setAppState(AppState.PREFERENCES)}
              className="btn-primary"
            >
              Try Again
            </button>

            <button
              onClick={handleBackToDashboard}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
