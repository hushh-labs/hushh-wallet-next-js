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
      {/* Header */}
      <div className="dashboard-header">
        <div className="container-narrow">
          <div className="header-content">
            <div className="header-text">
              <h1 className="dashboard-title">
                Build your <span className="font-black">HUSHH cards</span>
              </h1>
              <p className="dashboard-subtitle">
                Show once, be served right.
              </p>
            </div>
            <div className="user-info">
              <div className="user-avatar">
                {user.name.charAt(0)}
              </div>
              <div className="user-details">
                <p className="user-name">{user.name}</p>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
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
