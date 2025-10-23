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

            {/* Share where it actually helps */}
            <div className="share-section">
              <div className="share-container">
                {/* Section title & deck */}
                <div className="share-header">
                  <h3 className="share-title">
                    Share where it actually helps
                  </h3>
                  <p className="share-deck">
                    Show your card at the counter or share a link with your booking—staff see your five food signals at a glance. Works with <strong className="text-ink">Apple Wallet</strong> and <strong className="text-ink">Google Wallet</strong>.
                  </p>
                </div>
                
                {/* 3-column use cases */}
                <div className="use-cases-grid">
                  <div className="use-case-card">
                    <h4 className="use-case-title">Restaurants & cafés</h4>
                    <p className="use-case-body">
                      Show at seating or share while booking a table. Servers instantly see: <strong className="text-ink">"Vegetarian · Medium · Italian; Gluten-free"</strong><br />
                      Less back-and-forth, fewer mistakes, faster orders.
                    </p>
                  </div>
                  
                  <div className="use-case-card">
                    <h4 className="use-case-title">Hotels & room service</h4>
                    <p className="use-case-body">
                      Attach the link in your reservation notes. Front desk and F&B know your <strong className="text-ink">Food Type</strong>, <strong className="text-ink">Spice</strong>, and <strong className="text-ink">Dietary</strong> before you arrive—breakfast and room-service get it right the first time.
                    </p>
                  </div>
                  
                  <div className="use-case-card">
                    <h4 className="use-case-title">Delivery & group orders</h4>
                    <p className="use-case-body">
                      Drop the link in the chat. Friends and colleagues know <strong className="text-ink">exactly</strong> what to pick for you—no long threads.
                    </p>
                  </div>
                </div>

                {/* How sharing works explainer */}
                <div className="sharing-explainer">
                  <div className="explainer-item">
                    <strong className="text-ink">Show in Wallet:</strong> Face is minimal; back lists all five.
                  </div>
                  <div className="explainer-separator"></div>
                  <div className="explainer-item">
                    <strong className="text-ink">Share a link:</strong> A light, read-only page with your five picks and two buttons: <strong className="text-ink">Add to Apple Wallet</strong> (iOS) and <strong className="text-ink">Save to Google Wallet</strong> (Android).
                  </div>
                  <div className="explainer-separator"></div>
                  <div className="explainer-item">
                    <strong className="text-ink">Privacy:</strong> The link carries only your five food signals—no name, no email. Links expire by default; you can make one public for 24h when needed.
                  </div>
                </div>

                {/* Bottom tagline */}
                <div className="platform-tagline">
                  <strong className="text-ink">Apple & Google, both covered</strong> — iPhone adds to <strong className="text-ink">Apple Wallet</strong>; Android can <strong className="text-ink">Save to Google Wallet</strong> from the same share link.
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
