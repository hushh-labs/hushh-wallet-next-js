'use client';

import { PersonalPayload } from '@/types';

interface CardPreviewProps {
  personalData: PersonalPayload;
  onGenerate: () => void;
  onEdit: () => void;
  isGenerating?: boolean;
}

export function CardPreview({ personalData, onGenerate, onEdit, isGenerating = false }: CardPreviewProps) {
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
        <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
          Preview Your Card
        </h2>
        <p className="text-gray-600 text-lg">
          Your premium personal identity card for Apple Wallet
        </p>
      </div>

      {/* Card Container */}
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          {/* Luxury Card */}
          <div className="relative group">
            <div 
              className="w-full h-64 rounded-2xl shadow-2xl transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-3xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #e94560 100%)',
              }}
            >
              {/* Premium Background Pattern */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                                   radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                }}
              ></div>

              {/* Card Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                {/* Header with Logo */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-300">
                        HUSHH PERSONAL
                      </div>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"></div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white opacity-80"></div>
                    </div>
                  </div>
                </div>

                {/* Primary Field - Name */}
                <div className="space-y-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide font-medium mb-2 text-amber-200">
                      Name
                    </div>
                    <div className="text-2xl font-bold leading-tight text-white drop-shadow-sm">
                      {personalData.preferredName}
                    </div>
                  </div>

                  {/* Secondary Fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs uppercase tracking-wide font-medium mb-1 text-amber-200">
                        Age
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {age} years
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide font-medium mb-1 text-amber-200">
                        Gender
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {personalData.gender}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs uppercase tracking-wide font-medium mb-1 text-amber-200">
                      Issued
                    </div>
                    <div className="text-xs font-medium text-white">
                      {issueDate}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-amber-400 rounded-full opacity-60"></div>
                    <div className="w-1 h-1 bg-amber-400 rounded-full opacity-30"></div>
                  </div>
                </div>
              </div>

              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-5 transform -skew-x-12 animate-pulse"></div>
            </div>
          </div>

          {/* QR Code Preview */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-black rounded-lg" style={{
                background: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='qr' patternUnits='userSpaceOnUse' width='8' height='8'%3e%3crect width='4' height='4' fill='%23000'/%3e%3crect x='4' y='4' width='4' height='4' fill='%23000'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23qr)'/%3e%3c/svg%3e")`,
                backgroundSize: '100% 100%'
              }}></div>
            </div>
            <div className="text-sm text-gray-500 mt-3 font-medium">Secure QR verification</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        <button
          onClick={onEdit}
          className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          disabled={isGenerating}
        >
          ← Edit Details
        </button>
        <button
          onClick={onGenerate}
          className={`flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:from-amber-600 hover:to-yellow-600 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : '+ Add to Apple Wallet'}
        </button>
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
          This premium card design follows Apple Wallet standards and will appear exactly as shown above. 
          Your card features secure QR verification and a luxury aesthetic optimized for Apple devices.
        </p>
      </div>
    </div>
  );
}
