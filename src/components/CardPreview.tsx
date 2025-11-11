'use client';

import { useState } from 'react';
import { PersonalPayload } from '@/types';

interface CardPreviewProps {
  personalData: PersonalPayload;
  onGenerate: () => void;
  onEdit: () => void;
  isGenerating?: boolean;
}

export function CardPreview({ personalData, onGenerate, onEdit, isGenerating = false }: CardPreviewProps) {
  const [showBack, setShowBack] = useState(false);

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Mask phone number (show last 4 digits)
  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return phone;
    const lastFour = phone.slice(-4);
    const masked = '*'.repeat(phone.length - 4);
    return masked + lastFour;
  };

  const age = calculateAge(personalData.dob);
  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-ink">Preview Your Card</h2>
        <p className="text-muted">
          This is how your personal identity card will appear in Apple Wallet.
        </p>
      </div>

      {/* Card Container */}
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          {/* Card Toggle */}
          <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowBack(false)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                !showBack 
                  ? 'bg-white text-ink shadow-sm' 
                  : 'text-muted hover:text-ink'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setShowBack(true)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                showBack 
                  ? 'bg-white text-ink shadow-sm' 
                  : 'text-muted hover:text-ink'
              }`}
            >
              Back
            </button>
          </div>

          {/* Card */}
          <div className="relative">
            {/* Front of Card */}
            <div 
              className={`
                w-full h-56 rounded-xl shadow-2xl transform transition-transform duration-500
                ${showBack ? 'rotateY-180' : 'rotateY-0'}
              `}
              style={{
                background: 'linear-gradient(135deg, rgb(117, 65, 10) 0%, rgb(139, 77, 15) 100%)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Card Front */}
              <div 
                className={`absolute inset-0 rounded-xl p-4 flex flex-col justify-between ${
                  showBack ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ 
                  color: 'rgb(255, 248, 235)',
                  backfaceVisibility: 'hidden'
                }}
              >
                {/* Header */}
                <div className="space-y-1">
                  <div 
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: 'rgb(216, 178, 111)' }}
                  >
                    HUSHH PERSONAL
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded"></div>
                </div>

                {/* Primary Field - Name */}
                <div className="space-y-3">
                  <div>
                    <div 
                      className="text-xs uppercase tracking-wide font-medium mb-1"
                      style={{ color: 'rgb(216, 178, 111)' }}
                    >
                      Name
                    </div>
                    <div className="text-lg font-semibold leading-tight">
                      {personalData.preferredName}
                    </div>
                  </div>

                  {/* Secondary Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div 
                        className="text-xs uppercase tracking-wide font-medium mb-1"
                        style={{ color: 'rgb(216, 178, 111)' }}
                      >
                        Age
                      </div>
                      <div className="text-sm font-medium">
                        {age} years old
                      </div>
                    </div>
                    <div>
                      <div 
                        className="text-xs uppercase tracking-wide font-medium mb-1"
                        style={{ color: 'rgb(216, 178, 111)' }}
                      >
                        Gender
                      </div>
                      <div className="text-sm font-medium">
                        {personalData.gender}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end">
                  <div>
                    <div 
                      className="text-xs uppercase tracking-wide font-medium mb-1"
                      style={{ color: 'rgb(216, 178, 111)' }}
                    >
                      Issued
                    </div>
                    <div className="text-xs font-medium">
                      {issueDate}
                    </div>
                  </div>
                  <div className="w-6 h-6 border border-current opacity-50 rounded"></div>
                </div>
              </div>

              {/* Card Back */}
              <div 
                className={`absolute inset-0 rounded-xl p-4 transform rotateY-180 ${
                  showBack ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ 
                  color: 'rgb(255, 248, 235)',
                  backfaceVisibility: 'hidden'
                }}
              >
                <div className="space-y-4 text-sm">
                  <div 
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: 'rgb(216, 178, 111)' }}
                  >
                    Personal Details
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div 
                        className="text-xs uppercase tracking-wide font-medium mb-1"
                        style={{ color: 'rgb(216, 178, 111)' }}
                      >
                        Legal Name
                      </div>
                      <div className="font-medium">
                        {personalData.legalName}
                      </div>
                    </div>

                    <div>
                      <div 
                        className="text-xs uppercase tracking-wide font-medium mb-1"
                        style={{ color: 'rgb(216, 178, 111)' }}
                      >
                        Phone
                      </div>
                      <div className="font-medium">
                        {maskPhone(personalData.phone)}
                      </div>
                    </div>

                    <div>
                      <div 
                        className="text-xs uppercase tracking-wide font-medium mb-1"
                        style={{ color: 'rgb(216, 178, 111)' }}
                      >
                        Date of Birth
                      </div>
                      <div className="font-medium">
                        {formatDate(personalData.dob)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-current border-opacity-20">
                    <div className="text-xs opacity-75">
                      Your personal identity card for convenient, privacy-focused identification.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Preview */}
          <div className="mt-4 text-center">
            <div className="inline-block w-16 h-16 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
              <div className="w-12 h-12 bg-black rounded" style={{
                background: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='qr' patternUnits='userSpaceOnUse' width='10' height='10'%3e%3crect width='5' height='5' fill='%23000'/%3e%3crect x='5' y='5' width='5' height='5' fill='%23000'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23qr)'/%3e%3c/svg%3e")`,
                backgroundSize: '100% 100%'
              }}></div>
            </div>
            <div className="text-xs text-muted mt-2">QR Code for verification</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        <button
          onClick={onEdit}
          className="btn-secondary flex-1"
          disabled={isGenerating}
        >
          ← Edit Details
        </button>
        <button
          onClick={onGenerate}
          className={`btn-primary flex-1 ${isGenerating ? 'loading' : ''}`}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : '+ Add to Apple Wallet'}
        </button>
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="text-sm text-muted max-w-md mx-auto">
          This preview shows exactly how your card will appear in Apple Wallet. 
          Tap front/back to see both sides of your digital identity card.
        </p>
      </div>
    </div>
  );
}
