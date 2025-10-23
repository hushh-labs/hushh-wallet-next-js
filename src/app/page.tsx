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
        // Handle error response
        try {
          const error = await response.json();
          throw new Error(error.error || 'Failed to generate pass');
        } catch {
          throw new Error('Failed to generate pass');
        }
      }

      // Check if the response is a .pkpass file (binary)
      const contentType = response.headers.get('content-type');
      if (contentType === 'application/vnd.apple.pkpass') {
        // Handle binary .pkpass file download
        const blob = await response.blob();
        const filename = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'HushOne-TasteCard.pkpass';
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Analytics: pkpass_issued
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'pkpass_issued', {
            event_category: 'pass_generation'
          });
        }

        // For iOS, show success
        if (isIOS) {
          // Analytics: wallet_open_attempt
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'wallet_open_attempt', {
              event_category: 'pass_generation'
            });
          }
        }
        
        setAppState(AppState.SUCCESS);
        setGeneratedURL(''); // No URL needed for direct download
      } else {
        // Handle JSON response (fallback/demo mode)
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

            {/* Value Proposition */}
            <div className="mt-20 pt-16 border-t border-subtle">
              <div className="prose max-w-4xl mx-auto">
                <p className="text-body text-muted text-justified">
                  Your taste is simple, personal, and doesn't need a profile. In one minute, select five food signals—what you eat, how spicy you like it, and a few favourites—and we'll mint a minimal, monochrome card you can keep in <strong className="text-ink">Apple Wallet</strong>. No feeds, no clutter—just a clean, verifiable summary of your preferences that's always one tap away.
                </p>
              </div>
            </div>

            {/* What you'll choose - Chipified Left Layout */}
            <div className="wyct-chipified">
              <div className="wyct-chipified-container">
                {/* Section title - left aligned */}
                <h3 className="wyct-chipified-title">
                  What you'll choose today
                </h3>
                
                {/* Chipified rows */}
                <div className="wyct-chipified-grid">
                  {/* Food Type row */}
                  <div className="wyct-chipified-row">
                    <div className="wyct-chipified-label">Food Type</div>
                    <div className="wyct-chipified-dash">–</div>
                    <div className="wyct-chipified-chips">
                      <span className="chip-pill">Vegetarian</span>
                      <span className="chip-pill">Non-Vegetarian</span>
                      <span className="chip-pill">Vegan</span>
                      <span className="chip-pill">Jain</span>
                      <span className="chip-pill">Eggetarian</span>
                      <span className="chip-pill">Other</span>
                    </div>
                  </div>
                  
                  {/* Spice Level row */}
                  <div className="wyct-chipified-row wyct-chipified-row-tight">
                    <div className="wyct-chipified-label">Spice Level</div>
                    <div className="wyct-chipified-dash">–</div>
                    <div className="wyct-chipified-chips">
                      <span className="chip-pill">Mild</span>
                      <span className="chip-pill">Medium</span>
                      <span className="chip-pill">Spicy</span>
                    </div>
                  </div>
                  
                  {/* Plus any three row */}
                  <div className="wyct-chipified-row">
                    <div className="wyct-chipified-label">Plus any three</div>
                    <div className="wyct-chipified-dash">–</div>
                    <div className="wyct-chipified-chips">
                      <span className="chip-pill chip-category">Cuisines</span>
                      <span className="chip-pill chip-category">Food Brands & Places</span>
                      <span className="chip-pill chip-category">Lifestyle & Diet</span>
                    </div>
                  </div>
                </div>
                
                {/* Rule card */}
                <div className="wyct-chipified-rule-card">
                  <strong className="font-semibold">Exact rule:</strong> choose <span className="font-mono font-semibold">5</span> in total. <strong className="font-semibold">Food Type</strong> and <strong className="font-semibold">Spice Level</strong> are required.
                </div>
              </div>
            </div>

            {/* Focus Cards */}
            <div className="focus-cards-section">
              <div className="focus-cards-container">
                <div className="focus-cards-grid">
                  <div className="focus-card">
                    <div className="focus-card-icon"></div>
                    <h4 className="focus-card-title">No sign-in</h4>
                    <p className="focus-card-body">We only need your five picks. No account, no feed, no spam.</p>
                  </div>
                  
                  <div className="focus-card">
                    <div className="focus-card-icon"></div>
                    <h4 className="focus-card-title">Monochrome by design</h4>
                    <p className="focus-card-body">Clean type, hairline rules, no shadows. Luxury without noise.</p>
                  </div>
                  
                  <div className="focus-card">
                    <div className="focus-card-icon"></div>
                    <h4 className="focus-card-title">Apple Wallet ready</h4>
                    <p className="focus-card-body">Add in seconds on iPhone. macOS Safari adds to iCloud Wallet.</p>
                  </div>
                </div>
              </div>
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
