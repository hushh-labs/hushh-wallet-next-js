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

export default function HomePage() {
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
      const response = await fetch('/api/passes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate pass');
      }

      const data = await response.json();
      setGeneratedURL(data.url);

      // Analytics: pkpass_issued
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pkpass_issued', {
          event_category: 'pass_generation'
        });
      }

      // For iOS, redirect to the wallet URL
      if (isIOS) {
        // Analytics: wallet_open_attempt
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'wallet_open_attempt', {
            event_category: 'pass_generation'
          });
        }
        
        window.location.href = data.url;
      } else {
        setAppState(AppState.SUCCESS);
      }

    } catch (error) {
      console.error('Generation error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate pass');
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.HERO);
    setErrorMessage('');
    setGeneratedURL('');
  };

  const handleEmailLink = () => {
    const subject = encodeURIComponent('Your Hushh Taste Card');
    const body = encodeURIComponent(`Here's your Hushh Taste Card: ${generatedURL}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {appState === AppState.HERO && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto px-6">
            <div className="bg-ink text-paper rounded-2xl p-12 text-center space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium opacity-80">Taste, simplified</p>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Build your <span className="font-black">Hushh Taste Card</span>
                </h1>
              </div>
              
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Pick five preferences and add a clean, luxury card to <strong>Apple Wallet</strong>.
              </p>

              <div className="pt-4">
                <button
                  onClick={handleGetStarted}
                  className="bg-paper text-ink px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </button>
              </div>

              <p className="text-xs opacity-70">
                Works on iPhone with Apple Wallet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Section */}
      {(appState === AppState.PREFERENCES || appState === AppState.GENERATING) && (
        <div className="min-h-screen py-12">
          <div className="max-w-6xl mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-12 space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-ink">
                Choose Your Preferences
              </h1>
              <p className="text-muted max-w-2xl mx-auto">
                Select exactly 5 preferences to create your personalized taste card.
                Food type and spice level are required.
              </p>
            </div>

            {/* Preference Selector */}
            <PreferenceSelector 
              onGenerate={handleGenerate}
              isGenerating={appState === AppState.GENERATING}
            />

            {/* Back Link */}
            <div className="text-center mt-8">
              <button
                onClick={handleReset}
                className="btn-secondary"
                disabled={appState === AppState.GENERATING}
              >
                ← Back to Home
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
              <h2 className="text-2xl font-bold text-ink">Card Generated!</h2>
              <p className="text-muted">
                {isIOS === false 
                  ? "Apple Wallet is iPhone-only. Email the link to yourself to open on your iPhone."
                  : "Your taste card is ready."
                }
              </p>
            </div>

            <div className="space-y-3">
              {generatedURL && (
                <div className="space-y-3">
                  <a
                    href={generatedURL}
                    className="btn-primary w-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Card
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
              onClick={handleReset}
              className="btn-secondary"
            >
              Create Another Card
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
              onClick={handleReset}
              className="btn-secondary"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
