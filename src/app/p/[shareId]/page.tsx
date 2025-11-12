'use client';

import { useState, useEffect } from 'react';
import { PublicProfile } from '@/types';

interface PublicViewerProps {
  params: Promise<{ shareId: string }>;
}

interface ProfileData {
  profile: PublicProfile;
  shareId: string;
  lastUpdated: string;
}

export default function PublicViewer({ params }: PublicViewerProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string>('');
  const [shareId, setShareId] = useState<string>('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError('');

        // Await params first
        const resolvedParams = await params;
        const currentShareId = resolvedParams.shareId;
        setShareId(currentShareId);
        
        const response = await fetch(`/api/p/${currentShareId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'Failed to load profile');
        }

        const result = await response.json();
        setData(result.data);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [params]);

  const handleDownloadContact = () => {
    if (!data) return;

    const { personal } = data.profile.sections;
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${personal.preferredName}
TEL:${personal.maskedPhone}
NOTE:Shared via hushh ID Card
END:VCARD`;

    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${personal.preferredName.replace(/[^a-zA-Z0-9]/g, '')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Updated recently';
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    if (diffDays < 7) return `Updated ${diffDays}d ago`;
    return `Updated on ${date.toLocaleDateString()}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#14191E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F8F5EB] text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#14191E] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#F8F5EB] mb-2">Profile Unavailable</h2>
          <p className="text-[#B8860B] mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#FFD700] text-[#14191E] rounded-lg font-medium hover:bg-[#E6C200] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { personal, food } = data.profile.sections;

  return (
    <div className="min-h-screen bg-[#14191E]">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-br from-[#1A1F25] via-[#14191E] to-[#0F1419] pt-12 pb-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FFD700]/10 to-transparent"></div>
        </div>
        
        <div className="max-w-md mx-auto px-6 relative">
          <div className="text-center">
            {/* Brand Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg flex items-center justify-center">
                  <span className="text-[#14191E] font-bold text-sm">H</span>
                </div>
                <span className="text-[#FFD700] font-bold text-sm tracking-wide uppercase">Hushh Signature Card</span>
              </div>
            </div>

            {/* Profile Avatar */}
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <span className="text-3xl font-bold text-[#14191E]">
                  {personal.preferredName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-[#14191E] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>

            {/* Name and Status */}
            <h1 className="text-3xl font-bold text-[#F8F5EB] mb-2 tracking-tight">
              {personal.preferredName}
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2A3038]/50 rounded-full border border-[#FFD700]/20">
              <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></div>
              <span className="text-[#FFD700] text-sm font-medium">
                {formatLastUpdated(data.lastUpdated)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 pb-8">
        {/* Personal Section */}
        <div className="bg-[#1A1F25] rounded-xl p-6 mb-4 border border-[#2A3038]">
          <h3 className="text-[#FFD700] font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Info
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#B8860B]">Age</span>
              <span className="text-[#F8F5EB]">{personal.age} years old</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B8860B]">Contact</span>
              <span className="text-[#F8F5EB] font-mono">{personal.maskedPhone}</span>
            </div>
          </div>
        </div>

        {/* Food Preferences Section */}
        <div className="bg-[#1A1F25] rounded-xl p-6 mb-6 border border-[#2A3038]">
          <h3 className="text-[#FFD700] font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Food Preferences
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#B8860B] text-sm">Diet & Spice</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-full text-[#FFD700] text-sm capitalize">
                  {food.foodType}
                </span>
                <span className="px-3 py-1 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-full text-[#FFD700] text-sm capitalize">
                  {food.spiceLevel} spice
                </span>
              </div>
            </div>

            {food.topCuisines.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#B8860B] text-sm">Favorite Cuisines</span>
                  <span className="text-[#666] text-xs">{food.topCuisines.length}/3</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {food.topCuisines.map((cuisine, index) => (
                    <span key={index} className="px-3 py-1 bg-[#2A3038] border border-[#3A4048] rounded-full text-[#F8F5EB] text-sm">
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {food.dishStyles.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#B8860B] text-sm">Dish Styles</span>
                  <span className="text-[#666] text-xs">{food.dishStyles.length}/3</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {food.dishStyles.map((style, index) => (
                    <span key={index} className="px-3 py-1 bg-[#2A3038] border border-[#3A4048] rounded-full text-[#F8F5EB] text-sm">
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {food.exclusions.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#B8860B] text-sm">Dietary Exclusions</span>
                  <span className="text-[#666] text-xs">{food.exclusions.length}/2</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {food.exclusions.map((exclusion, index) => (
                    <span key={index} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-300 text-sm">
                      {exclusion}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleDownloadContact}
            className="w-full py-3 bg-[#FFD700] text-[#14191E] rounded-lg font-medium hover:bg-[#E6C200] transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Contact (.vcf)
          </button>
          
          <button
            onClick={() => window.open('https://hushh.ai', '_blank')}
            className="w-full py-3 bg-[#2A3038] text-[#F8F5EB] rounded-lg font-medium hover:bg-[#3A4048] transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About hushh
          </button>
        </div>

        {/* Privacy Footer */}
        <div className="mt-8 pt-6 border-t border-[#2A3038]">
          <p className="text-center text-[#666] text-sm">
            Shared via <span className="text-[#FFD700]">hushh</span> • Privacy-first identity
          </p>
          <p className="text-center text-[#555] text-xs mt-2">
            All data is sanitized and controlled by the card owner
          </p>
        </div>
      </div>
    </div>
  );
}
