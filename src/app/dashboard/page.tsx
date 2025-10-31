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

// Mock data for now - will be replaced with real auth/database
const MOCK_CARD_DATA: Partial<Record<CardType, CardData>> = {
  PERSONAL: {
    type: 'PERSONAL',
    status: 'NOT_CREATED',
    answers: {} as any,
    version: 1
  },
  FOOD: {
    type: 'FOOD',
    status: 'ACTIVE',
    answers: {} as any,
    lastSerial: 'H-FOOD-12345',
    lastIssued: new Date(),
    version: 1
  }
};

interface CardTileProps {
  type: CardType;
  title: string;
  description: string;
  status: CardStatus;
  lastIssued?: Date;
  onClick: () => void;
}

function CardTile({ type, title, description, status, lastIssued, onClick }: CardTileProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Format date only on client side to avoid hydration mismatch
    if (lastIssued) {
      setFormattedDate(lastIssued.toLocaleDateString());
    }

    // Detect mobile for optimized tilt behavior
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [lastIssued]);

  const getStatusConfig = () => {
    switch (status) {
      case 'NOT_CREATED':
        return {
          chipText: 'Awaiting Commission',
          chipClass: 'status-chip-inactive',
          cardClass: 'silver-edition',
          actionText: 'Commission Collection'
        };
      case 'ACTIVE':
        return {
          chipText: 'Live Collection',
          chipClass: 'status-chip-active', 
          cardClass: 'gold-edition',
          actionText: 'Access Collection',
          subText: formattedDate ? `Last commissioned: ${formattedDate}` : ''
        };
      case 'UPDATE_AVAILABLE':
        return {
          chipText: 'Refinement Available',
          chipClass: 'status-chip-update',
          cardClass: 'silver-edition',
          actionText: 'Refine Collection'
        };
      case 'REVOKED':
        return {
          chipText: 'Archive',
          chipClass: 'status-chip-revoked',
          cardClass: 'silver-edition',
          actionText: 'Commission New'
        };
    }
  };

  const config = getStatusConfig();

  // Optimized tilt configuration - disabled on mobile for performance
  const getTiltConfig = () => {
    if (isMobile) {
      return {
        tiltEnable: false,
        scale: 1,
        perspective: 1000,
        speed: 0
      };
    }

    const isGold = config.cardClass === 'gold-edition';
    
    return {
      tiltEnable: true,
      perspective: 1000,
      scale: 1.01, // Reduced scale for smoother performance
      speed: 300, // Faster response
      max: isGold ? 8 : 6, // Reduced tilt angles
      glare: !isMobile,
      'max-glare': isGold ? 0.2 : 0.15, // Reduced glare
      'glare-prerender': false,
      gyroscope: false, // Disabled for better performance
    };
  };

  // Card content
  const cardContent = (
    <div 
      className={`card-tile ${config.cardClass} ${isMobile ? 'mobile-optimized' : ''}`} 
      onClick={onClick}
    >
      <div className="card-tile-header">
        <div className="card-tile-info">
          <h3 className="card-tile-title">{title}</h3>
          <p className="card-tile-description">{description}</p>
          {config.subText && <p className="card-tile-subtext">{config.subText}</p>}
        </div>
        <div className={`status-chip ${config.chipClass}`}>
          {config.chipText}
        </div>
      </div>
      <div className="card-tile-action">
        <span className="action-text">{config.actionText}</span>
        <svg className="action-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );

  // Return with or without Tilt based on device
  if (isMobile) {
    return (
      <div className="card-container mobile">
        {cardContent}
      </div>
    );
  }

  return (
    <Tilt
      {...getTiltConfig()}
      className="card-container desktop"
    >
      {cardContent}
    </Tilt>
  );
}

export default function DashboardPage() {
  const [cards, setCards] = useState<Partial<Record<CardType, CardData>>>(MOCK_CARD_DATA);

  const handleCardClick = (cardType: CardType) => {
    // Navigate to specific card flow
    window.location.href = `/cards/${cardType.toLowerCase()}`;
  };

  const cardDefinitions = [
    {
      type: 'PERSONAL' as CardType,
      title: 'HUSHH Signature Identity Card',
      description: 'Your identity, elegantly minimal.'
    },
    {
      type: 'FOOD' as CardType,
      title: 'HUSHH Culinary Signature Card',
      description: 'Your taste, zero confusion.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Premium Enhanced Header */}
      <div className="dashboard-header">
        <div className="header-rail">
          <div className="header-text-stack">
            <div className="header-eyebrow">PRIVATE COLLECTION</div>
            <h1 className="dashboard-title">
              Curate Your Exclusive Hushh Collection
            </h1>
            <div className="dashboard-title-keyline"></div>
            <p className="dashboard-deck">
              Present once. Experience excellence, always.
            </p>
            <WalletIntegration />
            <div className="status-row-enhanced">
              <div className="progress-widget">
                <div className="progress-ring">
                  <div className="progress-fill" style={{ '--progress': '50%' } as React.CSSProperties}></div>
                </div>
                <span className="progress-text">1 of 2 Curated</span>
              </div>
              <span className="status-separator">·</span>
              <a href="/cards/personal" className="missing-link">Awaiting: Signature Profile</a>
            </div>
          </div>
          <div className="header-actions">
            <div className="action-box">
              <div className="action-header">
                <span className="cards-counter">COLLECTION: 1 / 2</span>
              </div>
              <div className="action-buttons">
                <button className="btn-primary-action">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Commission Profile Collection
                </button>
                <button className="btn-secondary-action">
                  Commission Culinary Collection
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="header-divider-enhanced"></div>
      </div>

      {/* Cards Grid */}
      <div className="dashboard-content">
        <div className="container-narrow">
          <div className="cards-grid">
            {cardDefinitions.map((cardDef) => {
              const cardData = cards[cardDef.type];
              if (!cardData) return null;
              
              return (
                <CardTile
                  key={cardDef.type}
                  type={cardDef.type}
                  title={cardDef.title}
                  description={cardDef.description}
                  status={cardData.status}
                  lastIssued={cardData.lastIssued}
                  onClick={() => handleCardClick(cardDef.type)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="dashboard-footer">
        <div className="container-narrow">
          <div className="footer-content">
            <p className="footer-text">
              Each collection is meticulously crafted to reflect your refined preferences, 
              creating an elegant digital presence within Apple Wallet. Modify at your discretion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
