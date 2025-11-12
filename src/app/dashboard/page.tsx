'use client';
// FORCE CACHE BUST: 8:30 PM Dashboard with only 2 cards
import { useState, useEffect } from 'react';
import { CardType, CardStatus, CardData } from '@/types';
import Tilt from 'react-parallax-tilt';

// Wallet integration component
interface WalletIntegrationProps {
  className?: string;
}

function WalletIntegration({ className = '' }: WalletIntegrationProps) {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [walletStates, setWalletStates] = useState({
    apple: 'default' as 'default' | 'loading' | 'success' | 'error',
    google: 'default' as 'default' | 'loading' | 'success' | 'error'
  });

  useEffect(() => {
    // Device detection
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  const handleWalletClick = (wallet: 'apple' | 'google') => {
    if (deviceType === 'desktop') {
      // Show helper text for desktop
      return;
    }

    // Set loading state
    setWalletStates(prev => ({ ...prev, [wallet]: 'loading' }));

    // Simulate wallet addition (replace with actual wallet integration)
    setTimeout(() => {
      setWalletStates(prev => ({ ...prev, [wallet]: 'success' }));
      
      // Show success toast
      const toastMessage = wallet === 'apple' ? 'Added to Apple Wallet' : 'Added to Google Wallet';
      // TODO: Implement toast notification
      console.log(toastMessage);
    }, 1500);
  };

  const getWalletStateConfig = (wallet: 'apple' | 'google') => {
    const state = walletStates[wallet];
    const isApple = wallet === 'apple';
    
    switch (state) {
      case 'loading':
        return {
          label: 'Adding...',
          disabled: true,
          showSpinner: true
        };
      case 'success':
        return {
          label: 'Added',
          disabled: true,
          showCheckmark: true
        };
      case 'error':
        return {
          label: 'Try again',
          disabled: false,
          showError: true
        };
      default:
        return {
          label: isApple ? 'Apple Wallet' : 'Google Wallet',
          disabled: deviceType === 'desktop',
          showDefault: true
        };
    }
  };

  const isPrimary = (wallet: 'apple' | 'google') => {
    if (deviceType === 'ios') return wallet === 'apple';
    if (deviceType === 'android') return wallet === 'google';
    return false;
  };

  return (
    <div className={`wallet-integration-card ${className}`}>
      {/* Feature Tile */}
      <div className="wallet-feature-tile">
        {/* Left: Circular icon container */}
        <div className="wallet-icon-container">
          <svg className="wallet-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 7V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>
            <path d="M3 10h18"/>
            <circle cx="17" cy="10" r="1"/>
          </svg>
        </div>
        
        {/* Right: Luxury copy */}
        <div className="wallet-content">
          <h6 className="wallet-title">
            Seamlessly integrated with Apple Wallet & Google Wallet for effortless sophistication.
          </h6>
        </div>
      </div>

      {/* Brand Chips */}
      <div className="wallet-chips">
        {/* Apple Wallet Chip */}
        <button
          onClick={() => handleWalletClick('apple')}
          disabled={getWalletStateConfig('apple').disabled}
          className={`wallet-chip ${isPrimary('apple') ? 'wallet-chip-primary' : 'wallet-chip-secondary'} ${getWalletStateConfig('apple').disabled ? 'wallet-chip-disabled' : ''}`}
          aria-label="Add to Apple Wallet"
          title={deviceType === 'desktop' ? 'Open on your phone to add' : 'Add to Apple Wallet'}
        >
          <div className="wallet-chip-content">
            {getWalletStateConfig('apple').showSpinner && (
              <div className="wallet-spinner" aria-hidden="true">
                <div className="spinner-ring"></div>
              </div>
            )}
            {getWalletStateConfig('apple').showCheckmark && (
              <svg className="wallet-checkmark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            )}
            {getWalletStateConfig('apple').showDefault && (
              <svg className="wallet-brand-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            )}
            <span className="wallet-chip-label">{getWalletStateConfig('apple').label}</span>
          </div>
        </button>

        {/* Google Wallet Chip */}
        <button
          onClick={() => handleWalletClick('google')}
          disabled={getWalletStateConfig('google').disabled}
          className={`wallet-chip ${isPrimary('google') ? 'wallet-chip-primary' : 'wallet-chip-secondary'} ${getWalletStateConfig('google').disabled ? 'wallet-chip-disabled' : ''}`}
          aria-label="Add to Google Wallet"
          title={deviceType === 'desktop' ? 'Open on your phone to add' : 'Add to Google Wallet'}
        >
          <div className="wallet-chip-content">
            {getWalletStateConfig('google').showSpinner && (
              <div className="wallet-spinner" aria-hidden="true">
                <div className="spinner-ring"></div>
              </div>
            )}
            {getWalletStateConfig('google').showCheckmark && (
              <svg className="wallet-checkmark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            )}
            {getWalletStateConfig('google').showDefault && (
              <svg className="wallet-brand-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              </svg>
            )}
            <span className="wallet-chip-label">{getWalletStateConfig('google').label}</span>
          </div>
        </button>
      </div>

      {/* Desktop Helper Text */}
      {deviceType === 'desktop' && (
        <p className="wallet-helper-text">
          Open on your phone to add
        </p>
      )}
    </div>
  );
}

// Mock data for unified card system
const UNIFIED_CARD_DATA = {
  status: 'PARTIAL', // 'NOT_CREATED', 'PARTIAL', 'COMPLETE'
  completedSections: ['FOOD'],
  missingSections: ['PERSONAL'],
  lastUpdated: new Date(),
  uid: 'unified-card-001'
};

interface ExecutiveRowProps {
  type: CardType;
  title: string;
  description: string;
  status: CardStatus;
  lastIssued?: Date;
  onClick: () => void;
}

function ExecutiveRow({ type, title, description, status, lastIssued, onClick }: ExecutiveRowProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    // Format date only on client side to avoid hydration mismatch
    if (lastIssued) {
      setFormattedDate(lastIssued.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }));
    }
  }, [lastIssued]);

  const getStatusConfig = () => {
    switch (status) {
      case 'NOT_CREATED':
        return {
          chipText: 'AWAITING COMMISSION',
          chipClass: 'executive-status-awaiting',
          actionText: 'Commission Collection'
        };
      case 'ACTIVE':
        return {
          chipText: 'LIVE COLLECTION',
          chipClass: 'executive-status-live',
          actionText: 'Access Collection',
          metaText: formattedDate ? `Last commissioned: ${formattedDate}` : ''
        };
      case 'UPDATE_AVAILABLE':
        return {
          chipText: 'REFINEMENT AVAILABLE',
          chipClass: 'executive-status-update',
          actionText: 'Refine Collection'
        };
      case 'REVOKED':
        return {
          chipText: 'ARCHIVE',
          chipClass: 'executive-status-revoked',
          actionText: 'Commission New'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div 
      className="executive-row"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="executive-row-content">
        {/* Line 1: Title + Status Pill */}
        <div className="executive-row-line1">
          <h3 className="executive-title">{title}</h3>
          <div className={`executive-status-pill ${config.chipClass}`}>
            {config.chipText}
          </div>
        </div>

        {/* Line 2: Subtitle (purple) */}
        <p className="executive-subtitle">{description}</p>

        {/* Line 3: Meta (if available) */}
        {config.metaText && (
          <p className="executive-meta">{config.metaText}</p>
        )}

        {/* Footer: Helper Text */}
        <div className="executive-footer">
          <span className="executive-helper">{config.actionText}</span>
          <svg className="executive-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [unifiedCardData, setUnifiedCardData] = useState(UNIFIED_CARD_DATA);

  const handleUnifiedCardClick = () => {
    // Navigate to unified card creation flow
    window.location.href = '/cards/create';
  };

  const unifiedCardDefinition = {
    title: 'HUSHH Signature Card',
    description: 'Your complete digital identity, elegantly unified.',
    sections: [
      { id: 'PERSONAL', name: 'Identity', completed: false },
      { id: 'FOOD', name: 'Culinary Preferences', completed: true }
    ]
  };

  return (
    <div className="min-h-screen">
      {/* Premium Enhanced Header */}
      <div className="dashboard-header">
        <div className="header-rail">
            <div className="header-text-stack">
              <div className="header-eyebrow">SIGNATURE COLLECTION</div>
              <h1 className="dashboard-title">
                Your Unified Hushh Signature Card
              </h1>
              <div className="dashboard-title-keyline"></div>
              <p className="dashboard-deck">
                All your preferences, one elegant card.
              </p>
              <WalletIntegration />
              <div className="status-row-enhanced">
                <div className="progress-widget">
                  <div className="progress-ring">
                    <div className="progress-fill" style={{ '--progress': '50%' } as React.CSSProperties}></div>
                  </div>
                  <span className="progress-text">1 of 2 Sections Complete</span>
                </div>
                <span className="status-separator">·</span>
                <span className="missing-link">Missing: Identity Section</span>
              </div>
            </div>
          <div className="header-actions">
            <div className="action-box __phone-rail">
              <div className="action-header">
                <span className="cards-counter">CARD PROGRESS: 50%</span>
              </div>
              <div className="action-buttons">
                <button className="btn-primary-action btn-rail" onClick={handleUnifiedCardClick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Complete Signature Card
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="header-divider-enhanced"></div>
      </div>

      {/* Unified Card Row */}
      <div className="dashboard-content">
        <div className="container-narrow">
          <div className="unified-card-container">
            <div className="unified-card" onClick={handleUnifiedCardClick}>
              <div className="unified-card-header">
                <div className="unified-title-section">
                  <h3 className="unified-card-title">{unifiedCardDefinition.title}</h3>
                  <div className="unified-status-pill">
                    PARTIALLY COMPLETE
                  </div>
                </div>
                <div className="unified-progress-ring">
                  <div className="unified-progress-fill" style={{ '--progress': '50%' } as React.CSSProperties}></div>
                  <span className="unified-progress-text">50%</span>
                </div>
              </div>
              
              <p className="unified-card-description">{unifiedCardDefinition.description}</p>
              
              <div className="unified-sections">
                {unifiedCardDefinition.sections.map((section) => (
                  <div key={section.id} className={`section-pill ${section.completed ? 'completed' : 'pending'}`}>
                    <div className="section-status">
                      {section.completed ? '✓' : '○'}
                    </div>
                    <span className="section-name">{section.name}</span>
                  </div>
                ))}
              </div>

              <div className="unified-card-footer">
                <span className="unified-helper">Complete all sections to generate your card</span>
                <svg className="unified-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="dashboard-footer">
        <div className="container-narrow">
          <div className="footer-content">
            <p className="footer-text">
              Your signature card combines all preferences into one elegant digital identity, 
              creating a sophisticated presence within Apple Wallet. Curate at your discretion.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .unified-card-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .unified-card {
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          border: 2px solid #e5e5e5;
          border-radius: 20px;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .unified-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .unified-card:hover {
          transform: translateY(-4px);
          border-color: #FFD700;
          box-shadow: 0 12px 40px rgba(255, 215, 0, 0.15);
        }

        .unified-card:hover::before {
          opacity: 1;
        }

        .unified-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .unified-title-section {
          flex: 1;
        }

        .unified-card-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.75rem;
          background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .unified-status-pill {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 1px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .unified-progress-ring {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 2rem;
        }

        .unified-progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: conic-gradient(#FFD700 0deg, #FFD700 calc(var(--progress) * 3.6deg), #f0f0f0 calc(var(--progress) * 3.6deg));
        }

        .unified-progress-text {
          position: relative;
          font-size: 0.9rem;
          font-weight: 700;
          color: #333;
          z-index: 1;
        }

        .unified-card-description {
          font-size: 1.1rem;
          color: #666;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .unified-sections {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .section-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 25px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .section-pill.completed {
          background: linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%);
          border: 2px solid #4ade80;
          color: #166534;
        }

        .section-pill.pending {
          background: linear-gradient(135deg, #fef3cd 0%, #fef9e7 100%);
          border: 2px solid #f59e0b;
          color: #92400e;
        }

        .section-status {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .section-pill.completed .section-status {
          background: #4ade80;
          color: white;
        }

        .section-pill.pending .section-status {
          background: #f59e0b;
          color: white;
        }

        .unified-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e5e5;
        }

        .unified-helper {
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .unified-chevron {
          color: #999;
          transition: transform 0.3s ease;
        }

        .unified-card:hover .unified-chevron {
          transform: translateX(4px);
          color: #FFD700;
        }

        @media (max-width: 768px) {
          .unified-card {
            padding: 1.5rem;
          }
          
          .unified-card-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .unified-progress-ring {
            margin-left: 0;
            align-self: flex-start;
          }
          
          .unified-sections {
            flex-direction: column;
          }
          
          .unified-card-footer {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
