'use client';

import { useMemo, useState } from 'react';

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const featureHighlights = useMemo(() => ([
    { label: 'Verified Tastemakers', value: '32,118', detail: 'Curated across the US' },
    { label: 'Private experiences', value: '180+', detail: 'Dining, galleries, ateliers' },
    { label: 'Concierge response', value: '< 15m', detail: 'Avg. member request' }
  ]), []);

  const promisePillars = [
    'Biometric-grade verification and Wallet-native security',
    'Concierge onboarding with zero logins required',
    'Net worth insights delivered privately to your Wallet'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim pass');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isIOS = () => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050203] text-cream">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -right-10 w-[420px] h-[420px] bg-[#f4b65c] opacity-40 blur-[140px]" />
        <div className="absolute -bottom-20 -left-10 w-[360px] h-[360px] bg-[#d27928] opacity-30 blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-white/5 opacity-30" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 space-y-6 text-center md:text-left">
          <p className="uppercase text-xs tracking-[0.45em] text-white/50 saira-royal">Royal society access</p>
          <h1 className="text-4xl md:text-6xl font-semibold saira-royal leading-tight">
            HUSHH Gold Pass
          </h1>
          <p className="max-w-3xl text-lg text-white/70 mx-auto md:mx-0 open-sans-clarity">
            An Apple Wallet identity for ultra-high intent circles. Claim the pass in under ten
            seconds and finish your profile whenever you wish—no apps, no logins, just a private,
            immutable proof of access.
          </p>
        </header>

        <section className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-8">
            <div className="glass-card p-8 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="px-4 py-1 rounded-full border border-white/10 text-sm text-white/70 stack-sans-notch-crest">
                  <span className="text-[#f7c66a]">Apple Wallet-first</span> access
                </div>
                <div className="px-4 py-1 rounded-full border border-white/10 text-sm text-white/70 stack-sans-notch-crest">
                  Invite-only • US verified
                </div>
              </div>
              <p className="text-2xl text-white/90 leading-relaxed open-sans-clarity">
                Designed for luxury homes, private member clubs, and royal families who need
                an irrefutable credential without friction. Every field is optional, but every
                detail unlocks more bespoke privileges.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {featureHighlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-5">
                    <div className="text-2xl font-semibold text-[#f7c66a] saira-royal">{item.value}</div>
                    <p className="text-sm text-white/80">{item.label}</p>
                    <p className="text-xs text-white/50 mt-1">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {promisePillars.map((pillar) => (
                <div key={pillar} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#f7c66a]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-white/80 open-sans-clarity">{pillar}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <p className="text-sm uppercase tracking-[0.5em] text-white/50 mb-4 saira-royal">Claim</p>
              <h2 className="text-3xl font-semibold text-white saira-royal">Your Gold Identity</h2>
              <p className="text-sm text-white/60 mt-3">
                HUSHH uses Apple Wallet security, so you can complete this in under ten seconds.
              </p>
            </div>

            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm text-white/70">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter the name to print on the pass"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-white/70">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm text-white/70">US Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="(555) 123-4567"
                  />
                  <p className="text-xs text-white/50">
                    We use SMS only for secure download links—no marketing blasts.
                  </p>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center gap-3 text-base"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating your pass
                    </>
                  ) : (
                    <>
                      <span>Get my Gold Pass</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M12 5l7 7-7 7"></path>
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-white/50">
                  Powered by HUSHH • Premium membership platform
                </p>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div className="rounded-[26px] border border-[#1f3b20] bg-[#081f11] px-6 py-5 text-white/80">
                  <p className="text-sm uppercase tracking-[0.45em] text-white/40 mb-2">Claim</p>
                  <h3 className="text-3xl font-semibold text-white saira-royal mb-1">
                    Your Gold Identity
                  </h3>
                  <p className="text-sm text-white/60">
                    HUSHH uses Apple Wallet security, so you can complete this in under ten seconds.
                  </p>
                  <div className="mt-5 rounded-2xl border border-[#2f5a32] bg-[#0d3416] px-6 py-4">
                    <p className="text-lg font-semibold text-emerald-100">
                      {result.existing ? 'Welcome back.' : 'You’re in.'}
                    </p>
                    <p className="text-sm text-white/70 mt-1">
                      Your HUSHH Gold Pass is ready to drop into Apple Wallet.
                    </p>
                  </div>
                </div>

                {isIOS() ? (
                  <a
                    href={result.addToWalletUrl}
                    className="w-full inline-flex items-center justify-between rounded-2xl border border-white/10 bg-black/90 px-5 py-4 text-base font-semibold text-white hover:bg-black"
                  >
                    <span className="flex items-center gap-2">
                      <span role="img" aria-label="iphone">📱</span>
                      Add to Apple Wallet
                    </span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </a>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-white/60">
                      Open this link on your iPhone to add directly to Apple Wallet:
                    </p>
                    <a
                      href={result.addToWalletUrl}
                      className="w-full inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base font-semibold hover:bg-white/10"
                    >
                      <span>Download Pass File</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M12 5l7 7-7 7"></path>
                      </svg>
                    </a>
                  </div>
                )}

                <a
                  href={result.profileUrl}
                  className="block w-full rounded-2xl border border-white/10 bg-transparent py-4 text-center text-white/80 hover:bg-white/5 transition"
                >
                  Complete your profile later
                </a>

                <button
                  onClick={() => {
                    setResult(null);
                    setFormData({ name: '', email: '', phone: '' });
                  }}
                  className="text-xs text-white/50 underline hover:text-white/80"
                >
                  Start another pass
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
