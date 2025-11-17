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
  cached?: boolean;
  calculation_breakdown?: {
    cached?: boolean;
    layer1_estimate?: {
      low: number;
      high: number;
      mid: number;
      confidence: number;
    };
    api_calls?: {
      fred_api: { called: boolean; timestamp: string; data?: any };
      census_api: { called: boolean; timestamp: string; data?: any };
      bls_api: { called: boolean; timestamp: string; data?: any };
      claude_api: { called: boolean; timestamp: string; enhanced?: boolean };
    };
    multipliers?: {
      geographic: number;
      age_income: number;
      address: number;
      total: number;
    };
    base_data?: {
      age_band: string;
      median_networth: number;
      data_source: string;
      data_year: number;
    };
  };
  debug_signals?: any;
}

interface LoadingStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  duration: number; // milliseconds
}

export default function NetWorthPage() {
  const params = useParams();
  const uid = params.uid as string;

  const [estimate, setEstimate] = useState<NetWorthEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    {
      id: 'profile',
      label: 'Loading Profile',
      description: 'Retrieving your demographic information...',
      completed: false,
      duration: 800
    },
    {
      id: 'federal_reserve',
      label: 'Federal Reserve Data',
      description: 'Fetching real-time economic indicators from FRED API...',
      completed: false,
      duration: 1200
    },
    {
      id: 'census',
      label: 'ZIP-Level Analysis',
      description: 'Analyzing local income distribution from Census ACS...',
      completed: false,
      duration: 1000
    },
    {
      id: 'bls',
      label: 'Age-Income Analysis',
      description: 'Getting earnings data from Bureau of Labor Statistics...',
      completed: false,
      duration: 900
    },
    {
      id: 'calculation',
      label: 'Layer-1 Calculation',
      description: 'Computing multi-source statistical estimates...',
      completed: false,
      duration: 600
    },
    {
      id: 'ai_enhancement',
      label: 'Claude AI Enhancement',
      description: 'Refining estimates with AI reasoning...',
      completed: false,
      duration: 1500
    }
  ]);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (uid) {
      fetchNetWorthEstimate();
    }
  }, [uid]);

  // Simulate loading steps for better UX
  useEffect(() => {
    if (loading && currentStep < loadingSteps.length) {
      const timer = setTimeout(() => {
        setLoadingSteps(prev => prev.map((step, index) => 
          index === currentStep ? { ...step, completed: true } : step
        ));
        setCurrentStep(prev => prev + 1);
      }, loadingSteps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [loading, currentStep, loadingSteps]);

  const fetchNetWorthEstimate = async () => {
    try {
      const response = await fetch(`/api/networth/estimate?uid=${uid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch estimate');
      }

      // If cached, skip loading animation
      if (data.cached) {
        setLoadingSteps(prev => prev.map(step => ({ ...step, completed: true })));
        setCurrentStep(loadingSteps.length);
        setLoading(false);
        setEstimate(data);
        return;
      }

      // Complete all steps when data arrives
      setTimeout(() => {
        setLoadingSteps(prev => prev.map(step => ({ ...step, completed: true })));
        setCurrentStep(loadingSteps.length);
        setLoading(false);
        setEstimate(data);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-yellow-400 animate-spin"></div>
              <div className="absolute inset-2 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {Math.round((currentStep / loadingSteps.length) * 100)}%
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Analyzing Your Net Worth</h1>
            <p className="text-white/80">
              Our AI is gathering data from multiple sources...
            </p>
          </div>

          <div className="space-y-4">
            {loadingSteps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-500 ${
                  step.completed 
                    ? 'bg-green-500/20 border border-green-400/30' 
                    : index === currentStep 
                      ? 'bg-yellow-400/20 border border-yellow-400/30' 
                      : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.completed 
                    ? 'bg-green-500' 
                    : index === currentStep 
                      ? 'bg-yellow-400 animate-pulse' 
                      : 'bg-white/20'
                }`}>
                  {step.completed ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : index === currentStep ? (
                    <div className="w-3 h-3 bg-amber-900 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-white/50 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${step.completed ? 'text-green-200' : 'text-white'}`}>
                    {step.label}
                  </h3>
                  <p className={`text-sm ${step.completed ? 'text-green-300/80' : 'text-white/70'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / loadingSteps.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-white/60 text-sm mt-2">
              Processing step {Math.min(currentStep + 1, loadingSteps.length)} of {loadingSteps.length}
            </p>
          </div>
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
          <div className="text-center mb-8 relative">
            {/* Refresh Icon - Top Right */}
            <button
              onClick={() => {
                setLoading(true);
                setCurrentStep(0);
                setLoadingSteps(prev => prev.map(step => ({ ...step, completed: false })));
                fetchNetWorthEstimate();
              }}
              className="absolute top-0 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center transition-all duration-200 group"
              title="Refresh Analysis"
            >
              <svg className="w-5 h-5 text-white group-hover:text-yellow-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>

            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-green-200 font-semibold">Analysis Complete</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Estimated Net Worth</h1>
            <p className="text-white/80">
              {estimate.cached ? 'Cached result from multi-source AI analysis' : '4-source AI analysis: FRED + Census + BLS + Claude'}
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
              <div className="text-sm text-white/60 mt-2 flex items-center justify-center space-x-4">
                <span>Confidence: {Math.round(estimate.confidence * 100)}%</span>
                {estimate.cached && (
                  <span className="bg-blue-500/20 text-blue-200 px-2 py-1 rounded text-xs">
                    Cached
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold text-white mb-3">How we calculated this</h3>
              <p className="text-white/80 leading-relaxed">
                {estimate.reasoning}
              </p>
            </div>
          </div>

          {/* API Analysis Transparency */}
          {estimate.calculation_breakdown && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">API Analysis Transparency</h2>
              <p className="text-white/80 mb-6">See exactly which data sources were used and how your estimate was calculated:</p>
              
              {/* API Call Status */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className={`flex items-start space-x-3 p-4 rounded-xl ${
                    estimate.calculation_breakdown.api_calls?.fred_api.called 
                      ? 'bg-green-500/20 border border-green-400/30' 
                      : 'bg-red-500/20 border border-red-400/30'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                      estimate.calculation_breakdown.api_calls?.fred_api.called ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {estimate.calculation_breakdown.api_calls?.fred_api.called ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">🏦 Federal Reserve (FRED)</h3>
                        <span className="text-xs text-white/60">
                          {estimate.calculation_breakdown.api_calls?.fred_api.timestamp && 
                            new Date(estimate.calculation_breakdown.api_calls.fred_api.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mb-2">Real-time economic indicators</p>
                      {estimate.calculation_breakdown.api_calls?.fred_api.called && estimate.calculation_breakdown.api_calls.fred_api.data && (
                        <div className="text-xs text-green-200">
                          Geographic Multiplier: {estimate.calculation_breakdown.api_calls.fred_api.data.geo_multiplier?.toFixed(2)}x
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-start space-x-3 p-4 rounded-xl ${
                    estimate.calculation_breakdown.api_calls?.census_api.called 
                      ? 'bg-green-500/20 border border-green-400/30' 
                      : 'bg-red-500/20 border border-red-400/30'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                      estimate.calculation_breakdown.api_calls?.census_api.called ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {estimate.calculation_breakdown.api_calls?.census_api.called ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">🏛️ Census Bureau (ACS)</h3>
                        <span className="text-xs text-white/60">
                          {estimate.calculation_breakdown.api_calls?.census_api.timestamp && 
                            new Date(estimate.calculation_breakdown.api_calls.census_api.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mb-2">ZIP-level income analysis</p>
                      {estimate.calculation_breakdown.api_calls?.census_api.called && estimate.calculation_breakdown.api_calls.census_api.data && (
                        <div className="text-xs text-green-200">
                          Affluence Score: {estimate.calculation_breakdown.api_calls.census_api.data.affluence_score?.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`flex items-start space-x-3 p-4 rounded-xl ${
                    estimate.calculation_breakdown.api_calls?.bls_api.called 
                      ? 'bg-green-500/20 border border-green-400/30' 
                      : 'bg-red-500/20 border border-red-400/30'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                      estimate.calculation_breakdown.api_calls?.bls_api.called ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {estimate.calculation_breakdown.api_calls?.bls_api.called ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">📊 Bureau of Labor Statistics</h3>
                        <span className="text-xs text-white/60">
                          {estimate.calculation_breakdown.api_calls?.bls_api.timestamp && 
                            new Date(estimate.calculation_breakdown.api_calls.bls_api.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mb-2">Age-specific earnings data</p>
                      {estimate.calculation_breakdown.api_calls?.bls_api.called && estimate.calculation_breakdown.api_calls.bls_api.data && (
                        <div className="text-xs text-green-200">
                          Age Income Index: {estimate.calculation_breakdown.api_calls.bls_api.data.age_income_index?.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-start space-x-3 p-4 rounded-xl ${
                    estimate.calculation_breakdown.api_calls?.claude_api.called 
                      ? 'bg-green-500/20 border border-green-400/30' 
                      : 'bg-red-500/20 border border-red-400/30'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                      estimate.calculation_breakdown.api_calls?.claude_api.called ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {estimate.calculation_breakdown.api_calls?.claude_api.called ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">🤖 Claude AI Enhancement</h3>
                        <span className="text-xs text-white/60">
                          {estimate.calculation_breakdown.api_calls?.claude_api.timestamp && 
                            new Date(estimate.calculation_breakdown.api_calls.claude_api.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mb-2">Advanced reasoning & refinement</p>
                      {estimate.calculation_breakdown.api_calls?.claude_api.enhanced && (
                        <div className="text-xs text-green-200">
                          Estimate Enhanced ✓
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculation Breakdown */}
              {estimate.calculation_breakdown.multipliers && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Calculation Multipliers</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-yellow-400">
                        {estimate.calculation_breakdown.multipliers.geographic.toFixed(2)}x
                      </div>
                      <div className="text-white/70 text-sm">Geographic</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-blue-400">
                        {estimate.calculation_breakdown.multipliers.age_income.toFixed(2)}x
                      </div>
                      <div className="text-white/70 text-sm">Age Income</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-green-400">
                        {estimate.calculation_breakdown.multipliers.address.toFixed(2)}x
                      </div>
                      <div className="text-white/70 text-sm">Address</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-xl border border-yellow-400/30">
                      <div className="text-2xl font-bold text-yellow-300">
                        {estimate.calculation_breakdown.multipliers.total.toFixed(2)}x
                      </div>
                      <div className="text-yellow-200 text-sm font-semibold">Total</div>
                    </div>
                  </div>

                  {/* Base Data */}
                  {estimate.calculation_breakdown.base_data && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <h4 className="text-white font-semibold mb-2">Base Demographics</h4>
                      <div className="text-sm text-white/80 space-y-1">
                        <div>Age Group: <span className="text-yellow-300">{estimate.calculation_breakdown.base_data.age_band}</span></div>
                        <div>Median Net Worth: <span className="text-yellow-300">${(estimate.calculation_breakdown.base_data.median_networth / 1000).toFixed(0)}k</span></div>
                        <div>Data Source: <span className="text-yellow-300">{estimate.calculation_breakdown.base_data.data_source}</span></div>
                        {estimate.calculation_breakdown.base_data.data_year && (
                          <div>Data Year: <span className="text-yellow-300">{estimate.calculation_breakdown.base_data.data_year}</span></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Enhanced Methodology */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Enhanced 4-Source Methodology</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">🏦</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Federal Reserve (FRED)</h3>
                    <p className="text-white/70 text-sm">Real-time state economic indicators and unemployment data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">🏛️</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Census ACS</h3>
                    <p className="text-white/70 text-sm">ZIP-level income distribution and affluence analysis</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">📊</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Bureau of Labor Statistics</h3>
                    <p className="text-white/70 text-sm">Age-specific earnings data and income patterns</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Claude AI Enhancement</h3>
                    <p className="text-white/70 text-sm">Advanced reasoning and pattern recognition</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources Badge */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-8">
            <div className="flex items-center justify-center space-x-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white">4</div>
                <div className="text-white/70 text-sm">Data Sources</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-white/70 text-sm">Max Confidence</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">ZIP</div>
                <div className="text-white/70 text-sm">Level Precision</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">Real-time</div>
                <div className="text-white/70 text-sm">Economic Data</div>
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
              Last updated: {new Date(estimate.lastUpdated).toLocaleDateString()} at {new Date(estimate.lastUpdated).toLocaleTimeString()}
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
              onClick={() => {
                setLoading(true);
                setCurrentStep(0);
                setLoadingSteps(prev => prev.map(step => ({ ...step, completed: false })));
                fetchNetWorthEstimate();
              }}
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
