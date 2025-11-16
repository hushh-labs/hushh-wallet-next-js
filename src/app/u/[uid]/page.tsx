'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { buildPassUrl, type User } from '@/lib/goldpass';

interface PublicPageProps {
  params: Promise<{
    uid: string;
  }>;
}

interface UserData {
  name: string;
  memberSince: string;
  tier: string;
  hasProfile: boolean;
}

export default function PublicVerificationPage({ params }: PublicPageProps) {
  const [uid, setUid] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveParamsAndFetchData = async () => {
      try {
        const resolvedParams = await params;
        setUid(resolvedParams.uid);
        
        const userRef = doc(db, 'users', resolvedParams.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          setError('Member not found');
          return;
        }
        
        const user = userDoc.data() as User;
        
        // Extract safe public information
        setUserData({
          name: user.identity.name,
          memberSince: user.meta.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Recently',
          tier: user.meta.tier || 'gold',
          hasProfile: !!user.profile
        });
        
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Unable to verify member');
      } finally {
        setIsLoading(false);
      }
    };

    resolveParamsAndFetchData();
  }, [params]);

  const handleAddToWallet = () => {
    const passUrl = buildPassUrl(uid);
    window.open(passUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying membership...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <a
              href="/"
              className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Get Your Gold Pass
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h1 className="text-2xl font-bold">
            Hushh Gold Member
          </h1>
          <p className="text-amber-100 mt-1">
            Verified Premium Member
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Member Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
            <div className="text-center">
              <div className="text-5xl mb-3">👑</div>
              <h2 className="text-xl font-bold">
                {userData.name}
              </h2>
              <p className="text-amber-100 text-sm">
                Gold Member
              </p>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6">
            {/* Member Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm font-medium">
                  Member ID
                </span>
                <span className="text-gray-800 font-mono text-sm">
                  {uid}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm font-medium">
                  Tier
                </span>
                <span className="text-amber-600 font-semibold text-sm">
                  {userData.tier.toUpperCase()}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm font-medium">
                  Member Since
                </span>
                <span className="text-gray-800 text-sm">
                  {userData.memberSince}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm font-medium">
                  Profile Status
                </span>
                <span className={`text-sm font-medium ${
                  userData.hasProfile 
                    ? 'text-green-600' 
                    : 'text-orange-600'
                }`}>
                  {userData.hasProfile ? '✓ Complete' : '⚠ Basic'}
                </span>
              </div>
            </div>

            {/* Add to Wallet Button */}
            <button
              onClick={handleAddToWallet}
              className="w-full mt-6 bg-black text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              📱 Add to Apple Wallet
            </button>
          </div>
        </div>

        {/* Benefits Display */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
            🎁 Gold Member Benefits
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-xs text-gray-700 font-medium">
                Priority Access
              </p>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-xs text-gray-700 font-medium">
                Exclusive Offers
              </p>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-2xl mb-2">🛡️</div>
              <p className="text-xs text-gray-700 font-medium">
                Premium Support
              </p>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="text-2xl mb-2">✨</div>
              <p className="text-xs text-gray-700 font-medium">
                VIP Experience
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                ✅ Membership Verified
              </p>
              <p className="text-xs text-green-700 mt-1">
                This member has valid Hushh Gold privileges
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Verified by <span className="font-semibold">Hushh Technologies</span>
          </p>
          <p className="mt-1">
            Secure • Authentic • Premium
          </p>
        </div>
      </div>
    </div>
  );
}
