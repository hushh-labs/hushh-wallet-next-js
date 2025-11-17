'use client';

import { useMemo, useState } from 'react';

const QR_MATRIX = [
  '111110011011111',
  '100010010010001',
  '101110011011101',
  '101000000000101',
  '101011111110101',
  '100010010010001',
  '111110011011111',
  '000000100000000',
  '111011101110111',
  '001000010000100',
  '111011101110111',
  '001000010000100',
  '111110011011111',
  '100010010010001',
  '101110011011101',
  '100000000000001',
  '111111111111111'
];

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

  const mintedLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date());
  }, []);

  const memberName = formData.name?.trim() || 'HUSHH Member';
  const qrColumns = QR_MATRIX[0].length;
  const qrRows = QR_MATRIX.length;

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

  const WalletIcon = () => (
    <span className="flex flex-col justify-between w-9 h-9 rounded-xl bg-black/80 border border-white/15 p-1.5 shadow-inner shadow-black/60">
      <span className="block h-1 rounded-full bg-gradient-to-r from-[#ff8a8a] via-[#ffc776] to-[#ffe66d]" />
      <span className="block h-1 rounded-full bg-gradient-to-r from-[#b6ffdb] via-[#6ed4f7] to-[#7f9dff]" />
      <span className="block h-1 rounded-full bg-gradient-to-r from-[#ffffff] via-[#d5d7ff] to-[#9ae1ff]" />
    </span>
  );

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
              <div className="space-y-7">
                <div className="royal-gold-pass-card">
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                      <div className="text-[0.75rem] uppercase tracking-[0.6em] text-white/90 font-semibold">
                        HUSHH
                      </div>
                      <div className="text-[0.6rem] uppercase tracking-[0.4em] text-white/60">
                        ROYAL MEMBER
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[4rem] leading-none font-bold tracking-[0.15em] text-white drop-shadow-lg">GOLD</p>
                        <p className="text-sm uppercase tracking-[0.6em] text-white/80 mt-1 font-medium">TIER</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[0.7rem] uppercase tracking-[0.5em] text-white/75 font-medium">MEMBER</p>
                      <p className="text-2xl font-bold saira-royal text-white drop-shadow-sm">{memberName}</p>
                    </div>
                    <div className="royal-gold-divider" />
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/70 font-medium">STATUS</p>
                        <p className="text-sm text-white/90">{result.existing ? 'VERIFIED' : 'PREMIUM'}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/70 font-medium">ISSUED</p>
                        <p className="text-sm text-white/90">{mintedLabel}</p>
                      </div>
                    </div>
                    <div className="royal-gold-qr">
                      <svg
                        viewBox={`0 0 ${qrColumns} ${qrRows}`}
                        xmlns="http://www.w3.org/2000/svg"
                        shapeRendering="crispEdges"
                        role="img"
                        aria-label="Stylized QR code preview"
                        className="royal-qr-code"
                      >
                        {QR_MATRIX.map((row, rowIndex) =>
                          row.split('').map((cell, cellIndex) =>
                            cell === '1' ? (
                              <rect
                                key={`${rowIndex}-${cellIndex}`}
                                x={cellIndex}
                                y={rowIndex}
                                width="1"
                                height="1"
                                fill="#1a0f06"
                              />
                            ) : null
                          )
                        )}
                      </svg>
                      <div className="royal-qr-label">
                        <p className="font-bold">HUSHH GOLD PASS</p>
                        <p className="text-[0.6rem] opacity-80">{result.uid ? `ID: ${result.uid.slice(0, 12).toUpperCase()}` : 'PENDING VERIFICATION'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/5 px-6 py-5 text-left text-white/80 space-y-3">
                  <p className="text-xs uppercase tracking-[0.55em] text-white/50">Claim confirmed</p>
                  <h3 className="text-2xl font-semibold text-white saira-royal">
                    Your Wallet-ready identity is live
                  </h3>
                  <p className="text-sm text-white/70">
                    {result.existing ? 'Welcome back to the royal registry.' : 'You’re officially inside.'} Tap the
                    button below on your iPhone to drop this credential directly into Apple Wallet.
                  </p>
                </div>

                {isIOS() ? (
                  <a
                    href={result.addToWalletUrl}
                    className="w-full inline-flex items-center justify-between rounded-2xl border border-white/10 bg-black/90 px-5 py-4 text-base font-semibold text-white hover:bg-black transition"
                  >
                    <span className="flex items-center gap-3">
                      <WalletIcon />
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
                      className="w-full inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base font-semibold hover:bg-white/10 transition"
                    >
                      <span className="flex items-center gap-3">
                        <WalletIcon />
                        Download Pass File
                      </span>
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
