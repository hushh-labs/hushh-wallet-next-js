'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface NetWorthEstimate {
  uid: string;
  estimateLow: number;
  estimateHigh: number;
  bandLabel: string;
  confidence: number;
  reasoning: string;
  disclaimer: string;
  lastUpdated: string;
}

export default function NetWorthPage() {
  const params = useParams();
  const uid = params.uid as string;

  const [estimate, setEstimate] = useState<NetWorthEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (uid) {
      fetchNetWorthEstimate();
    }
  }, [uid]);

  const fetchNetWorthEstimate = async () => {
    try {
      const response = await fetch(`/api/networth/estimate?uid=${uid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch estimate');
      }

      setEstimate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`;
    }
    return `$${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-yellow-600 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Analyzing Your Net Worth</h1>
          <p className="text-white/80">
            Our AI is crunching the numbers based on your profile and market data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-yellow-600 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Unable to Calculate</h1>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:from-yellow-300 hover:to-amber-400 transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-yellow-600 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">No Estimate Available</h1>
          <p className="text-white/80">
            Unable to generate estimate. Please complete your profile first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-yellow-600">
      <div className="container mx-auto px-4 py-8">
        <div className="max-width-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Your Estimated Net Worth</h1>
            <p className="text-white/80">
              AI-powered estimate based on your profile and market data
            </p>
          </div>

          {/* Main Estimate Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 mb-8">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-white mb-2">
                {formatCurrency(estimate.estimateLow)} - {formatCurrency(estimate.estimateHigh)}
              </div>
              <div className="text-xl text-yellow-200 font-semibold">
                {estimate.bandLabel}
              </div>
              <div className="text-sm text-white/60 mt-2">
                Confidence: {Math.round(estimate.confidence * 100)}%
              </div>
            </div>

            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold text-white mb-3">How we calculated this</h3>
              <p className="text-white/80 leading-relaxed">
                {estimate.reasoning}
              </p>
            </div>
          </div>

          {/* Methodology */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Our Methodology</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-900 text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Demographic Analysis</h3>
                  <p className="text-white/70 text-sm">Age and location-based wealth patterns from Federal Reserve data</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-900 text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Market Data Integration</h3>
                  <p className="text-white/70 text-sm">Real estate values, income statistics, and economic indicators</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-900 text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">AI Enhancement</h3>
                  <p className="text-white/70 text-sm">Claude AI refines estimates using advanced financial modeling</p>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-2">Important Disclaimer</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {estimate.disclaimer}
            </p>
            <p className="text-white/60 text-xs mt-3">
              Last updated: {new Date(estimate.lastUpdated).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex space-x-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-white/10 text-white font-bold py-3 px-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              Back to Pass
            </button>
            <button
              onClick={fetchNetWorthEstimate}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:from-yellow-300 hover:to-amber-400 transition-all duration-200"
            >
              Refresh Estimate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
