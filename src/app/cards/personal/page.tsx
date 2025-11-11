'use client';
// Force cache refresh for new single-page flow - deployed at 11:08 AM
import { useState, useEffect } from 'react';
import { PersonalDataSelector } from '@/components/PersonalDataSelector';
import { CardPreview } from '@/components/CardPreview';
import { PersonalPayload } from '@/types';

enum AppState {
  HERO = 'hero',
  FORM = 'form',
  PREVIEW = 'preview',
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error'
}

export default function PersonalCardPage() {
  const [appState, setAppState] = useState<AppState>(AppState.HERO);
  const [isIOS, setIsIOS] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [generatedURL, setGeneratedURL] = useState<string>('');
  const [personalData, setPersonalData] = useState<PersonalPayload | null>(null);

  // Device detection (same as food card)
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
    setAppState(AppState.FORM);
  };

  // Form submission -> Preview (not direct generation)
  const handleFormSubmit = (data: PersonalPayload) => {
    setPersonalData(data);
    setAppState(AppState.PREVIEW);
  };

  // Preview -> Generate pass
  const handleGenerate = async () => {
    if (!personalData) return;
    
    setAppState(AppState.GENERATING);
    setErrorMessage('');

    try {
      // Convert personal data to food card format for working API
      const foodCardFormat = {
        foodType: personalData.preferredName || 'Personal',
        spice: 'Medium',
        cuisines: [],
        dishes: [],
        exclusions: []
      };

      const response = await fetch('/api/passes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(foodCardFormat),
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
        const filename = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'HushOne-PersonalCard.pkpass';
        
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

  // Preview -> Edit (go back to form)
  const handleEditFromPreview = () => {
    setAppState(AppState.FORM);
  };

  const handleReset = () => {
    setAppState(AppState.HERO);
    setErrorMessage('');
    setGeneratedURL('');
  };

  const handleEmailLink = () => {
    const subject = encodeURIComponent('Your Hushh Personal Card');
    const body = encodeURIComponent(`Here's your Hushh Personal Card: ${generatedURL}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
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
                <p className="text-eyebrow">Identity, simplified</p>
                <h1 className="text-hero text-ink">
                  Build your <span className="font-black">Hushh Personal Data Card</span>
                </h1>
              </div>
              
              <p className="text-deck text-muted max-w-3xl mx-auto">
                Your essential personal information in a clean, luxury card for <strong className="text-ink">Apple Wallet</strong>.
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

      {/* Form Section */}
      {(appState === AppState.FORM || appState === AppState.GENERATING) && (
        <div className="min-h-screen bg-paper">
          <div className="section-padding">
            <div className="container-narrow">
              {/* Header */}
              <div className="text-center mb-12 space-y-6 fade-in">
                <p className="text-eyebrow">Enter Your Details</p>
                <h1 className="text-hero text-ink">
                  Fill your <span className="font-black">personal information</span>
                </h1>
                <p className="text-deck text-muted max-w-3xl mx-auto">
                  Complete all fields to create your personalized identity card. 
                  <strong className="text-ink">All fields</strong> are required for a complete card.
                </p>
              </div>

              {/* Personal Data Selector */}
              <div className={`${appState === AppState.GENERATING ? 'loading' : ''}`}>
                <PersonalDataSelector 
                  onGenerate={handleFormSubmit}
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
        </div>
      )}

      {/* Preview Section */}
      {appState === AppState.PREVIEW && personalData && (
        <div className="min-h-screen bg-paper">
          <div className="section-padding">
            <div className="container-narrow">
              <CardPreview 
                personalData={personalData}
                onGenerate={handleGenerate}
                onEdit={handleEditFromPreview}
                isGenerating={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Generating State */}
      {appState === AppState.GENERATING && personalData && (
        <div className="min-h-screen bg-paper">
          <div className="section-padding">
            <div className="container-narrow">
              <CardPreview 
                personalData={personalData}
                onGenerate={handleGenerate}
                onEdit={handleEditFromPreview}
                isGenerating={true}
              />
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
                  : "Your personal card is ready."
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
              onClick={() => setAppState(AppState.FORM)}
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
