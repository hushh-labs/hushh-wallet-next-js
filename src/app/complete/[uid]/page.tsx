'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface ProfileFormData {
  city: string;
  state: string;
  zip: string;
  gender: string;
  age: string;
  street1: string;
}

export default function ProfileCompletePage({ params }: { params: { uid: string } }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const uid = params.uid;

  const [formData, setFormData] = useState<ProfileFormData>({
    city: '',
    state: '',
    zip: '',
    gender: '',
    age: '',
    street1: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [memberName, setMemberName] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing token. Please use the link from your pass.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !uid) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          token,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zip: formData.zip || undefined,
          gender: formData.gender || undefined,
          age: formData.age ? parseInt(formData.age) : undefined,
          street1: formData.street1 || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess(true);
      setMemberName(data.member || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  if (!token) {
    return (
      <div className="min-h-screen bg-[#050203] flex items-center justify-center px-4 text-cream">
        <div className="glass-card max-w-md mx-auto p-10 text-center">
          <h1 className="text-3xl font-semibold saira-royal mb-3">Access denied</h1>
          <p className="text-white/70 text-sm">
            Invalid or missing token. Please scan the link directly from the back of your HUSHH Gold Pass.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#050203] flex items-center justify-center px-4 text-cream">
        <div className="glass-card max-w-md mx-auto p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl mx-auto bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <svg className="w-7 h-7 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-semibold saira-royal mb-2">Profile updated</h1>
            <p className="text-white/70">
              Thank you{memberName && `, ${memberName}`} — your concierge now has the latest preferences on file.
            </p>
          </div>
          
          <a
            href="/"
            className="btn-primary inline-flex items-center justify-center gap-2 text-base w-full"
          >
            Return to Gold Pass
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050203] text-cream">
      <div className="relative max-w-5xl mx-auto px-4 py-12 lg:px-0">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#d27928] opacity-40 blur-[150px]" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card p-10 space-y-8 self-start">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.45em] text-white/50 saira-royal">Complete profile</p>
              <h1 className="text-4xl font-semibold saira-royal text-white">Unlock Concierge Precision</h1>
              <p className="text-white/70 leading-relaxed">
                Share only what you’re comfortable with. Your location and demographic signals help us
                pre-load venues, valuations, and experiences before you ever arrive.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/20 via-white/5 to-transparent p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">Concierge readiness</p>
                <p className="text-3xl font-semibold text-white">72%</p>
                <p className="text-xs text-white/60 mt-1">Based on the intelligence already on file.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#fcd9a7]/10 via-transparent to-white/5 p-5 space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">Lifestyle lanes</p>
                <div className="flex flex-wrap gap-2 text-xs text-cream/80">
                  {['Fine Dining', 'Members Clubs', 'Immersive Travel', 'Wellbeing'].map(item => (
                    <span key={item} className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 space-y-3">
              <p className="text-sm text-white/60">What this powers</p>
              <ul className="space-y-2 text-sm text-white/80 open-sans-clarity">
                <li>• City-specific concierge drops</li>
                <li>• Net-worth calibration via HUSHH Net Worth layer</li>
                <li>• White-glove verification for in-person hosts</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/5 bg-gradient-to-r from-white/5 to-transparent p-6 space-y-3">
              <p className="text-sm text-white/60">Luxury data pledge</p>
              <p className="text-sm text-white/70 leading-relaxed">
                Your entries are encrypted, never resold, and only visible to your concierge pod. Every update
                sharpens our ability to stage-arrive perks, transport, and private access exactly when you need it.
              </p>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10">★</span>
                <span>ISO-grade storage • SOC 2 infrastructure • Zero marketing spam</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm text-white/70">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your city"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm text-white/70">State</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="input-field bg-white/5 text-cream"
                  >
                    <option value="" className="text-gray-700">Select</option>
                    {stateOptions.map(state => (
                      <option key={state} value={state} className="text-gray-800">
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="zip" className="text-sm text-white/70">ZIP Code</label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-sm text-white/70">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="input-field bg-white/5 text-cream"
                  >
                    <option value="" className="text-gray-700">Select</option>
                    <option value="male" className="text-gray-800">Male</option>
                    <option value="female" className="text-gray-800">Female</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm text-white/70">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    min="13"
                    max="120"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="street1" className="text-sm text-white/70">Street Address (Optional)</label>
                <input
                  type="text"
                  id="street1"
                  name="street1"
                  value={formData.street1}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="123 Main Street"
                />
                <p className="text-xs text-white/50">Never shared publicly. Used for private concierge routing.</p>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating…
                  </>
                ) : (
                  <>
                    <span>Save details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-white/50">
              All fields optional. You can skip now and come back via your pass at any time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
