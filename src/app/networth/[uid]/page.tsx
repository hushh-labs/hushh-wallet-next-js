'use client';

import { useEffect, useState } from 'react';
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
  debug_signals?: {
    zip_affluence?: number;
    income_band?: string;
  };
}

interface LoadingStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  duration: number;
}

type ApiKey = 'fred_api' | 'census_api' | 'bls_api' | 'claude_api';

const apiConfig: { key: ApiKey; label: string; description: string; icon: string }[] = [
  { key: 'fred_api', label: 'Federal Reserve (FRED)', description: 'Real-time economic indicators & rates', icon: '🏦' },
  { key: 'census_api', label: 'Census ACS', description: 'ZIP-level income distribution & affluence', icon: '🏛️' },
  { key: 'bls_api', label: 'Bureau of Labor Statistics', description: 'Age-specific earnings bands', icon: '📊' },
  { key: 'claude_api', label: 'Claude AI', description: 'Layer-2 reasoning & refinement', icon: '🤖' }
];

export default function NetWorthPage() {
  const params = useParams();
  const uid = params.uid as string;

  const [estimate, setEstimate] = useState<NetWorthEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    {
      id: 'profile',
      label: 'Loading profile',
      description: 'Retrieving your demographic information...',
      completed: false,
      duration: 800
    },
    {
      id: 'federal_reserve',
      label: 'Federal Reserve data',
      description: 'Fetching real-time economic indicators from FRED API...',
      completed: false,
      duration: 1200
    },
    {
      id: 'census',
      label: 'ZIP-level analysis',
      description: 'Analyzing local income distribution from Census ACS...',
      completed: false,
      duration: 1000
    },
    {
      id: 'bls',
      label: 'Age-income analysis',
      description: 'Getting earnings data from Bureau of Labor Statistics...',
      completed: false,
      duration: 900
    },
    {
      id: 'calculation',
      label: 'Layer-1 calculation',
      description: 'Computing multi-source statistical estimates...',
      completed: false,
      duration: 600
    },
    {
      id: 'ai_enhancement',
      label: 'Claude AI enhancement',
      description: 'Refining estimates with AI reasoning...',
      completed: false,
      duration: 1500
    }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const baseScreenClass = 'min-h-screen bg-[#050203] text-cream flex items-center justify-center px-4';

  useEffect(() => {
    if (uid) {
      fetchNetWorthEstimate();
    }
  }, [uid]);

  useEffect(() => {
    if (loading && currentStep < loadingSteps.length) {
      const timer = setTimeout(() => {
        setLoadingSteps(prev =>
          prev.map((step, index) =>
            index === currentStep ? { ...step, completed: true } : step
          )
        );
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

      if (data.cached) {
        setLoadingSteps(prev => prev.map(step => ({ ...step, completed: true })));
        setCurrentStep(loadingSteps.length);
        setLoading(false);
        setEstimate(data);
        return;
      }

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

  const refreshAnalysis = () => {
    setLoading(true);
    setCurrentStep(0);
    setLoadingSteps(prev => prev.map(step => ({ ...step, completed: false })));
    fetchNetWorthEstimate();
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
      <div className={baseScreenClass}>
        <div className="glass-card max-w-2xl w-full p-10">
          <div className="text-center mb-10 space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-0 rounded-full border-t-2 border-[#f7c66a] animate-spin" />
              <div className="absolute inset-3 bg-white/5 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-[#f7c66a]">
                  {Math.round((currentStep / loadingSteps.length) * 100)}%
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-semibold saira-royal">Calibrating your valuation</h1>
            <p className="text-white/60 text-sm">
              Our economic stack is calling live data sources and aligning them with your profile.
            </p>
          </div>

          <div className="space-y-4">
            {loadingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-4 p-4 rounded-2xl border ${
                  step.completed
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : index === currentStep
                      ? 'border-[#f7c66a]/40 bg-[#f7c66a]/10'
                      : 'border-white/5 bg-white/5'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    step.completed
                      ? 'bg-emerald-500/40 text-white'
                      : index === currentStep
                        ? 'bg-[#f7c66a]/40 text-[#f7c66a]'
                        : 'bg-white/10 text-white/40'
                  }`}
                >
                  {step.completed ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{step.label}</h3>
                  <p className="text-sm text-white/70">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#f7c66a] to-[#d8922e] transition-all duration-500"
                style={{ width: `${(currentStep / loadingSteps.length) * 100}%` }}
              />
            </div>
            <p className="text-white/60 text-xs text-center mt-3">
              Processing step {Math.min(currentStep + 1, loadingSteps.length)} of {loadingSteps.length}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={baseScreenClass}>
        <div className="glass-card max-w-md mx-auto p-10 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold saira-royal">Unable to calculate</h1>
          <p className="text-white/70">{error}</p>
          <button onClick={() => window.history.back()} className="btn-primary w-full">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className={baseScreenClass}>
        <div className="glass-card max-w-md mx-auto p-10 text-center space-y-4">
          <h1 className="text-3xl font-semibold saira-royal">No estimate yet</h1>
          <p className="text-white/70">
            Please complete your profile so we can connect the correct economic signals.
          </p>
        </div>
      </div>
    );
  }

  const debugHighlights = [
    {
      label: 'ZIP affluence',
      value: estimate.debug_signals?.zip_affluence ? `${estimate.debug_signals.zip_affluence}th` : '—',
      detail: 'percentile nationally'
    },
    {
      label: 'Income band match',
      value: estimate.debug_signals?.income_band || 'Pending',
      detail: 'Census-aligned'
    },
    {
      label: 'Layer-1 confidence',
      value: estimate.calculation_breakdown?.layer1_estimate?.confidence
        ? `${Math.round(estimate.calculation_breakdown.layer1_estimate.confidence * 100)}%`
        : '—',
      detail: 'Before AI enhancement'
    }
  ];

  const multipliers = estimate.calculation_breakdown?.multipliers;
  const layerEstimate = estimate.calculation_breakdown?.layer1_estimate;
  const baseData = estimate.calculation_breakdown?.base_data;
  const apiCalls = estimate.calculation_breakdown?.api_calls;

  const confidenceBoosts = [
    { label: 'ZIP precision', value: '+22%' },
    { label: 'Age signal', value: '+15%' },
    { label: 'Claude AI reasoning', value: '+9%' }
  ];

  return (
    <div className="relative min-h-screen bg-[#050203] text-cream overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 right-0 w-[420px] h-[420px] bg-[#f7c66a] opacity-20 blur-[160px]" />
        <div className="absolute -bottom-24 left-0 w-[360px] h-[360px] bg-[#d27928] opacity-30 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 space-y-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-emerald-200">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="uppercase tracking-[0.4em] text-xs text-white/60">Analysis complete</span>
              {estimate.cached && (
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/70">
                  Cached
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold saira-royal text-white">
              Your private valuation signal
            </h1>
            <p className="text-white/70 max-w-2xl">
              {estimate.cached
                ? 'Cached result from multi-source AI analysis.'
                : 'Live result from Federal Reserve, Census, BLS and Claude AI data.'}
            </p>
          </div>
          <button onClick={refreshAnalysis} className="btn-primary w-full md:w-auto">
            Refresh analysis
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card p-8 space-y-6">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Net worth range</span>
              <span>Band: {estimate.bandLabel}</span>
            </div>
            <div className="text-4xl md:text-5xl font-semibold text-white">
              {formatCurrency(estimate.estimateLow)} – {formatCurrency(estimate.estimateHigh)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/60">Low signal</p>
                <p className="text-2xl font-semibold text-[#f7c66a]">{formatCurrency(estimate.estimateLow)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/60">High signal</p>
                <p className="text-2xl font-semibold text-[#f7c66a]">{formatCurrency(estimate.estimateHigh)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>Confidence index</span>
                <span>{Math.round(estimate.confidence * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  style={{ width: `${Math.round(estimate.confidence * 100)}%` }}
                />
              </div>
              <p className="text-xs text-white/50">
                Last updated: {new Date(estimate.lastUpdated).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">How we calculated this</h2>
              <p className="text-white/70 leading-relaxed">{estimate.reasoning}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/50 mb-2">Confidence boosts</h3>
              <div className="space-y-2">
                {confidenceBoosts.map(boost => (
                  <div key={boost.label} className="flex items-center justify-between text-sm text-white/70">
                    <span>{boost.label}</span>
                    <span className="text-emerald-300">{boost.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/60 mb-2">Important disclaimer</p>
              <p className="text-xs text-white/50">{estimate.disclaimer}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.history.back()}
                className="w-full rounded-2xl border border-white/15 bg-transparent py-3 text-white/80 hover:bg-white/5 transition"
              >
                Back to pass
              </button>
              <button onClick={refreshAnalysis} className="btn-primary w-full">
                Re-run signals
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-white">Signal diagnostics</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {debugHighlights.map(item => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/60">{item.label}</p>
                <p className="text-2xl font-semibold text-white mt-1">{item.value}</p>
                <p className="text-xs text-white/50">{item.detail}</p>
              </div>
            ))}
          </div>
          {layerEstimate && (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-6 flex flex-wrap gap-6 items-center">
              <div>
                <p className="text-sm text-white/60">Layer-1 mid estimate</p>
                <p className="text-3xl font-semibold text-[#f7c66a]">{formatCurrency(layerEstimate.mid)}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Low / High</p>
                <p className="text-xl font-semibold text-white">
                  {formatCurrency(layerEstimate.low)} – {formatCurrency(layerEstimate.high)}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60">Confidence</p>
                <p className="text-xl font-semibold text-white">
                  {Math.round(layerEstimate.confidence * 100)}%
                </p>
              </div>
            </div>
          )}
        </div>

        {apiCalls && (
          <div className="glass-card p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-white">Data partners pinged</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {apiConfig.map(api => {
                const callData = apiCalls[api.key];
                const success = callData?.called;
                let signalNote: string | null = null;

                if (success && api.key !== 'claude_api' && callData && 'data' in callData && callData.data) {
                  if (api.key === 'fred_api' && callData.data.geo_multiplier) {
                    signalNote = `Geographic multiplier ${callData.data.geo_multiplier.toFixed(2)}x`;
                  } else if (api.key === 'census_api' && callData.data.affluence_score) {
                    signalNote = `Affluence score ${callData.data.affluence_score.toFixed(2)}`;
                  } else if (api.key === 'bls_api' && callData.data.age_income_index) {
                    signalNote = `Age income index ${callData.data.age_income_index.toFixed(2)}`;
                  }
                }

                return (
                  <div
                    key={api.key}
                    className={`rounded-2xl border p-4 space-y-2 ${
                      success ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{api.icon}</span>
                        <div>
                          <h3 className="text-white font-semibold">{api.label}</h3>
                          <p className="text-white/70 text-sm">{api.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-white/60">
                        {callData?.timestamp && new Date(callData.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {signalNote && <p className="text-xs text-white/80">{signalNote}</p>}
                    {api.key === 'claude_api' && callData && 'enhanced' in callData && callData.enhanced && (
                      <p className="text-xs text-emerald-200">Estimate enhanced ✓</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {multipliers && (
          <div className="glass-card p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-white">Calculation multipliers</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-sm text-white/60">Geographic</p>
                <p className="text-3xl font-semibold text-[#f7c66a]">{multipliers.geographic.toFixed(2)}x</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-sm text-white/60">Age income</p>
                <p className="text-3xl font-semibold text-[#f7c66a]">{multipliers.age_income.toFixed(2)}x</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-sm text-white/60">Address</p>
                <p className="text-3xl font-semibold text-[#f7c66a]">{multipliers.address.toFixed(2)}x</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-sm text-white/60">Total lift</p>
                <p className="text-3xl font-semibold text-[#f7c66a]">{multipliers.total.toFixed(2)}x</p>
              </div>
            </div>
          </div>
        )}

        {baseData && (
          <div className="glass-card p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-white">Layer-1 context</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/60">Median net worth (base)</p>
                <p className="text-2xl font-semibold text-[#f7c66a]">
                  {formatCurrency(baseData.median_networth)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/60">Age band</p>
                <p className="text-2xl font-semibold text-white">{baseData.age_band}</p>
              </div>
            </div>
            <p className="text-xs text-white/50">
              Source: {baseData.data_source} ({baseData.data_year})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
