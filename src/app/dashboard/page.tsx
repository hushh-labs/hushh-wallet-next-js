'use client';
// FORCE CACHE BUST: 8:30 PM Dashboard with only 2 cards
import { useState, useEffect } from 'react';
import { CardType, CardStatus, CardData } from '@/types';

// Mock data for now - will be replaced with real auth/database
const MOCK_USER = {
  id: '1',
  name: 'Demo User',
  email: 'demo@hushh.ai'
};

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
  const getStatusConfig = () => {
    switch (status) {
      case 'NOT_CREATED':
        return {
          chipText: 'Not created',
          chipClass: 'status-chip-inactive',
          actionText: 'Create card'
        };
      case 'ACTIVE':
        return {
          chipText: 'Active',
          chipClass: 'status-chip-active', 
          actionText: 'View card',
          subText: lastIssued ? `Last issued: ${lastIssued.toLocaleDateString()}` : ''
        };
      case 'UPDATE_AVAILABLE':
        return {
          chipText: 'Update available',
          chipClass: 'status-chip-update',
          actionText: 'Re-issue'
        };
      case 'REVOKED':
        return {
          chipText: 'Revoked',
          chipClass: 'status-chip-revoked',
          actionText: 'Create new'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="card-tile" onClick={onClick}>
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
}

export default function DashboardPage() {
  const [cards, setCards] = useState<Partial<Record<CardType, CardData>>>(MOCK_CARD_DATA);
  const [user] = useState(MOCK_USER);

  const handleCardClick = (cardType: CardType) => {
    // Navigate to specific card flow
    window.location.href = `/cards/${cardType.toLowerCase()}`;
  };

  const cardDefinitions = [
    {
      type: 'PERSONAL' as CardType,
      title: 'HUSHH Personal Data Card',
      description: 'Your identity, elegantly minimal.'
    },
    {
      type: 'FOOD' as CardType,
      title: 'HUSHH Food Taste Card',
      description: 'Your taste, zero confusion.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#14191E]">
      {/* Premium Enhanced Header */}
      <div className="dashboard-header">
        <div className="header-rail">
          <div className="header-text-stack">
            <div className="header-eyebrow">DASHBOARD</div>
            <h1 className="dashboard-title">
              Set up your Hushh passes
            </h1>
            <div className="dashboard-title-keyline"></div>
            <p className="dashboard-deck">
              Show once, get served right.
            </p>
            <div className="dashboard-micro-enhanced">
              <svg className="wallet-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="5" width="22" height="14" rx="2" ry="2"/>
                <path d="m23 7-2 0"/>
                <path d="m23 11-2 0"/>
              </svg>
              <span>Apple Wallet & Google Wallet supported.</span>
              <svg className="apple-logo" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="dot-separator">●</span>
              <svg className="google-logo" width="14" height="14" viewBox="0 0 48 48" fill="none">
                <path d="M44.5 20H24v8.5h11.8C35.2 32.7 30.9 36 24 36c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#4285F4"/>
              </svg>
            </div>
            <div className="status-row-enhanced">
              <div className="progress-widget">
                <div className="progress-ring">
                  <div className="progress-fill" style={{ '--progress': '50%' } as React.CSSProperties}></div>
                </div>
                <span className="progress-text">1 of 2 set</span>
              </div>
              <span className="status-separator">·</span>
              <a href="/cards/personal" className="missing-link">Missing: Profile Pass</a>
            </div>
          </div>
          <div className="header-actions">
            <div className="action-box">
              <div className="action-header">
                <span className="cards-counter">CARDS: 1 / 2</span>
              </div>
              <div className="action-buttons">
                <button className="btn-primary-action">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Create Profile Pass
                </button>
                <button className="btn-secondary-action">
                  Create Taste Pass
                </button>
              </div>
            </div>
            <div className="user-info-enhanced">
              <div className="user-avatar">
                {user.name.charAt(0)}
              </div>
              <div className="user-details">
                <p className="user-name">{user.name}</p>
                <p className="user-email">{user.email}</p>
                <div className="user-chips">
                  <span className="user-chip">Primary Pass</span>
                  <span className="user-chip">Apple</span>
                  <span className="user-chip">Google</span>
                </div>
              </div>
              <div className="user-actions">
                <button className="icon-btn" title="Add to Apple Wallet">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.017 3.652c-.8-.961-2.139-1.652-3.573-1.652-0.221 0-0.442 0.017-0.661 0.051 0.132 2.139 1.097 3.956 2.42 5.148 0.8 0.733 1.87 1.364 3.056 1.364 0.309 0 0.618-0.034 0.918-0.103-0.221-2.104-1.097-3.869-2.16-4.808zM18.5 15.5c-0.55 1.164-1.364 2.104-2.42 2.726-0.827 0.487-1.87 0.785-2.988 0.785-1.052 0-2.087-0.264-3.056-0.785-1.056-0.622-1.87-1.562-2.42-2.726-0.55-1.164-0.827-2.328-0.827-3.5s0.277-2.336 0.827-3.5c0.55-1.164 1.364-2.104 2.42-2.726 0.969-0.521 2.004-0.785 3.056-0.785 1.118 0 2.161 0.298 2.988 0.785 1.056 0.622 1.87 1.562 2.42 2.726 0.55 1.164 0.827 2.328 0.827 3.5s-0.277 2.336-0.827 3.5z"/>
                  </svg>
                </button>
                <button className="icon-btn" title="Add to Google Wallet">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  </svg>
                </button>
                <svg className="chevron-right" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
              Each card stores your preferences securely and creates a minimal, 
              shareable profile for Apple Wallet. Update anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
