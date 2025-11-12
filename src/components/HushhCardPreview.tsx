'use client';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface CardData {
  personal?: {
    preferredName?: string;
    legalName?: string;
    phone?: string;
    dob?: string;
    gender?: string;
  };
  food?: {
    cuisinePreferences?: string[];
    allergies?: string[];
    dietaryRestrictions?: string[];
    spiceLevel?: string;
  };
  shareUrl: string;
  uid: string;
}

interface HushhCardPreviewProps {
  cardData: CardData;
  className?: string;
}

export function HushhCardPreview({ cardData, className = '' }: HushhCardPreviewProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code for the share URL
    const generateQRCode = async () => {
      try {
        const qrDataUrl = await QRCode.toDataURL(cardData.shareUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (cardData.shareUrl) {
      generateQRCode();
    }
  }, [cardData.shareUrl]);

  const getDisplayName = () => {
    if (cardData.personal?.preferredName) {
      return cardData.personal.preferredName;
    }
    if (cardData.personal?.legalName) {
      return cardData.personal.legalName;
    }
    return 'Hushh Member';
  };

  const hasPersonalData = cardData.personal && Object.values(cardData.personal).some(val => val);
  const hasFoodData = cardData.food && Object.values(cardData.food).some(val => val && (Array.isArray(val) ? val.length > 0 : true));

  return (
    <div className={`hushh-card-preview ${className}`}>
      {/* Card Container */}
      <div className="card-container">
        <div className="luxury-card">
          {/* Header Section */}
          <div className="card-header">
            <div className="card-brand">
              <span className="brand-text">HUSHH</span>
            </div>
            <div className="card-type">SIGNATURE CARD</div>
          </div>

          {/* Main Content */}
          <div className="card-content">
            {/* Left Side - Information */}
            <div className="card-info">
              <div className="card-name">{getDisplayName()}</div>
              
              {hasPersonalData && (
                <div className="card-section">
                  <div className="section-label">IDENTITY</div>
                  <div className="section-details">
                    {cardData.personal?.phone && (
                      <div className="detail-item">{cardData.personal.phone}</div>
                    )}
                    {cardData.personal?.dob && (
                      <div className="detail-item">Born {cardData.personal.dob}</div>
                    )}
                  </div>
                </div>
              )}

              {hasFoodData && (
                <div className="card-section">
                  <div className="section-label">CULINARY</div>
                  <div className="section-details">
                    {cardData.food?.cuisinePreferences && cardData.food.cuisinePreferences.length > 0 && (
                      <div className="detail-item">
                        {cardData.food.cuisinePreferences.slice(0, 2).join(', ')}
                        {cardData.food.cuisinePreferences.length > 2 && '...'}
                      </div>
                    )}
                    {cardData.food?.spiceLevel && (
                      <div className="detail-item">Spice: {cardData.food.spiceLevel}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Card ID */}
              <div className="card-id">
                ID: {cardData.uid.slice(-8).toUpperCase()}
              </div>
            </div>

            {/* Right Side - QR Code */}
            <div className="card-qr">
              {qrCodeDataUrl && (
                <>
                  <div className="qr-container">
                    <img src={qrCodeDataUrl} alt="QR Code" className="qr-image" />
                  </div>
                  <div className="qr-label">SCAN TO VIEW</div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="card-footer">
            <div className="footer-gradient"></div>
            <div className="footer-brand">
              <span className="footer-text">HUSHH</span>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="card-actions">
          <button className="btn-download" onClick={() => window.location.href = `/api/cards/download/${cardData.uid}`}>
            <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Add to Apple Wallet
          </button>
          
          <a 
            href={cardData.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-share"
          >
            <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16,6 12,2 8,6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Share Profile
          </a>
        </div>
      </div>

      <style jsx>{`
        .hushh-card-preview {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }

        .card-container {
          max-width: 500px;
          width: 100%;
        }

        .luxury-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
          border: 2px solid #333;
          border-radius: 20px;
          padding: 2rem;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 215, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .luxury-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .card-brand {
          position: relative;
        }

        .brand-text {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 3px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        .card-type {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 2px;
          color: #999;
          text-align: right;
        }

        .card-content {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2rem;
          align-items: flex-start;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .card-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .section-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: #FFD700;
          text-transform: uppercase;
        }

        .section-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item {
          font-size: 0.85rem;
          color: #ccc;
          line-height: 1.3;
        }

        .card-id {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 1px;
          color: #666;
          margin-top: auto;
          padding-top: 1rem;
        }

        .card-qr {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .qr-container {
          background: white;
          padding: 0.75rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .qr-image {
          width: 120px;
          height: 120px;
          display: block;
        }

        .qr-label {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 1px;
          color: #999;
          text-align: center;
          text-transform: uppercase;
        }

        .card-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2rem;
        }

        .footer-gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #FFD700 50%, transparent 100%);
        }

        .footer-brand {
          margin-top: 1rem;
        }

        .footer-text {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 4px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0.7;
        }

        .card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-download, .btn-share {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-download {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
        }

        .btn-download:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
        }

        .btn-share {
          background: transparent;
          border: 2px solid #333;
          color: white;
        }

        .btn-share:hover {
          background: #333;
          transform: translateY(-2px);
          color: white;
        }

        .btn-icon {
          width: 18px;
          height: 18px;
        }

        @media (max-width: 640px) {
          .luxury-card {
            padding: 1.5rem;
          }
          
          .card-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .card-qr {
            order: -1;
            margin-bottom: 1rem;
          }
          
          .qr-image {
            width: 100px;
            height: 100px;
          }

          .card-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
