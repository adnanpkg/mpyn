'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Mail } from 'lucide-react';
import { indianStates } from '@/lib/indian-data';
import { haptic, spring, pressScale } from '@/lib/haptics';
import { sendOtp, verifyOtp } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

interface OnboardingProps {
  onComplete: () => void;
}

type Mode = 'welcome' | 'signup' | 'signin';
type SignupStep = 1 | 2 | 3 | 4 | 5 | 6;
type SigninStep = 1 | 2 | 3;

const slideVariants = {
  enter: (dir: number) => ({ filter: 'blur(10px)', opacity: 0 }),
  center: { filter: 'blur(0px)', opacity: 1 },
  exit: (dir: number) => ({ filter: 'blur(10px)', opacity: 0 }),
};

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [mode, setMode] = useState<Mode>('welcome');
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [signinStep, setSigninStep] = useState<SigninStep>(1);
  const [direction, setDirection] = useState(1);

  // Onboarding data
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [role, setRole] = useState<'creator' | 'business' | ''>('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  // Stored userId after OTP verified (for profile completion)
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const goSignupNext = useCallback(() => {
    setDirection(1);
    setSignupStep((s) => Math.min(s + 1, 6) as SignupStep);
    setError('');
  }, []);

  const goSignupBack = useCallback(() => {
    setDirection(-1);
    setError('');
    if (signupStep === 1) { setMode('welcome'); return; }
    setSignupStep((s) => Math.max(s - 1, 1) as SignupStep);
  }, [signupStep]);

  const goSigninBack = useCallback(() => {
    setDirection(-1);
    setError('');
    if (signinStep === 1) { setMode('welcome'); return; }
    setSigninStep((s) => Math.max(s - 1, 1) as SigninStep);
  }, [signinStep]);

  const filteredStates = indianStates.filter((s) =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase())
  );
  const stateData = indianStates.find((s) => s.name === selectedState);
  const filteredCities = (stateData?.cities ?? []).filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const [otpSent, setOtpSent] = useState(false);

  // ── Send OTP ──────────────────────────────────────────────
  const handleSendOtp = async (isSignup: boolean, isResend = false) => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await sendOtp(email.trim().toLowerCase());
      setOtpSent(true);
      if (isResend) setOtpCode(''); // clear old code on resend
      haptic.success();
      // Only advance the step on the FIRST send, not on resend
      if (!isResend) {
        if (isSignup) goSignupNext();
        else setSigninStep(2);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'failed to send otp');
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────
  const handleVerifyOtp = async (isSignup: boolean) => {
    if (otpCode.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const result = await verifyOtp(email.trim().toLowerCase(), otpCode.trim());
      setVerifiedUserId(result.user._id as string);
      setIsNewUser(result.isNewUser);
      haptic.success();

      if (isSignup) {
        // Go to username step
        goSignupNext();
      } else {
        // Sign-in: check if profile is complete
        if (result.isNewUser || !result.user.username || !result.user.role) {
          // New user who signed in — need to complete profile via signup flow
          setMode('signup');
          setSignupStep(1);
        } else {
          onComplete();
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'wrong code, try again');
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  // ── Complete profile (final signup step) ──────────────────
  const handleSignupComplete = async () => {
    if (!username.trim()) return;
    // Hard block — must have gone through OTP verification
    if (!verifiedUserId) {
      setError('please verify your email first');
      haptic.error();
      return;
    }
    setLoading(true);
    setError('');
    try {
      await convex.mutation(api.users.completeProfile, {
        userId: verifiedUserId as any,
        username: username.trim().toLowerCase(),
        role: role as 'creator' | 'business',
        state: selectedState,
        city: selectedCity,
      });
      haptic.success();
      onComplete();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'signup failed');
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  const showBack = mode === 'signup' || mode === 'signin';

  return (
    <div className="app-container flex flex-col min-h-screen bg-bg">
      <div className="relative flex-1 overflow-hidden">
        {showBack && (
          <motion.button
            className="absolute top-4 left-4 z-20 p-2 text-dim"
            onClick={() => {
              haptic.tap();
              if (mode === 'signup') goSignupBack();
              else goSigninBack();
            }}
            {...pressScale}
          >
            <ArrowLeft size={20} />
          </motion.button>
        )}

        <AnimatePresence mode="wait" custom={direction}>

          {/* ── WELCOME ─────────────────────────────────────── */}
          {mode === 'welcome' && (
            <StepWrapper key="welcome" custom={direction}>
              <div className="flex flex-col items-center justify-center min-h-screen px-6">
                <img src="/icon.svg" alt="multiply." className="w-16 h-16 mb-6" />
                <h1 className="font-heading font-bold text-4xl text-text mb-2">multiply.</h1>
                <p className="text-muted text-sm font-body mb-12 text-center">
                  where local creators meet local business
                </p>
                <motion.button
                  className="pill-btn-primary w-full mb-4"
                  onClick={() => { haptic.tap(); setMode('signup'); setDirection(1); }}
                  {...pressScale}
                >
                  sign up
                </motion.button>
                <motion.button
                  className="text-muted text-sm font-body"
                  onClick={() => { haptic.tap(); setMode('signin'); setDirection(1); }}
                  {...pressScale}
                >
                  already have an account?{' '}
                  <span className="text-text underline">sign in</span>
                </motion.button>
              </div>
            </StepWrapper>
          )}

          {/* ── SIGN IN step 1 — email ───────────────────────── */}
          {mode === 'signin' && signinStep === 1 && (
            <StepWrapper key="signin-email" custom={direction}>
              <div className="flex flex-col px-6 pt-20">
                <h1 className="font-heading font-bold text-3xl text-text mb-2">welcome back.</h1>
                <p className="text-muted text-sm font-body mb-8">
                  enter your email — we'll send a 6-digit code
                </p>
                <input
                  className="search-input mb-4"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                {error && <p style={{ color: '#FF3B30' }} className="text-xs font-mono mb-3">{error}</p>}
                <motion.button
                  className="pill-btn-primary w-full disabled:opacity-40"
                  disabled={!email.trim() || loading}
                  onClick={() => handleSendOtp(false)}
                  {...pressScale}
                >
                  {loading ? 'sending...' : 'send code'}
                </motion.button>
              </div>
            </StepWrapper>
          )}

          {/* ── SIGN IN step 2 — enter OTP ───────────────────── */}
          {mode === 'signin' && signinStep === 2 && (
            <StepWrapper key="signin-otp" custom={direction}>
              <div className="flex flex-col items-center px-6 pt-20 text-center">
                <div className="w-16 h-16 rounded-full bg-elevated border border-border flex items-center justify-center mb-6">
                  <Mail size={26} className="text-text" />
                </div>
                <h1 className="font-heading font-bold text-3xl text-text mb-2">check your email.</h1>
                <p className="text-muted text-sm font-body mb-8 max-w-xs">
                  we sent a 6-digit code to{' '}
                  <span className="text-text font-medium">{email}</span>
                </p>
                <OtpField value={otpCode} onChange={setOtpCode} />
                {error && <p className="text-red-400 text-xs font-mono mt-3">{error}</p>}
                {otpSent && !error && (
                  <p className="text-text text-xs font-mono mt-3">✓ new code sent — check spam too</p>
                )}
                <motion.button
                  className="pill-btn-primary w-full mt-6 disabled:opacity-40"
                  disabled={otpCode.length !== 6 || loading}
                  onClick={() => handleVerifyOtp(false)}
                  {...pressScale}
                >
                  {loading ? 'verifying...' : 'verify code'}
                </motion.button>
                <button
                  className="text-dim text-xs font-mono mt-4"
                  onClick={() => handleSendOtp(false, true)}
                  disabled={loading}
                >
                  resend code
                </button>
              </div>
            </StepWrapper>
          )}

          {/* ── SIGNUP step 1 — state ────────────────────────── */}
          {mode === 'signup' && signupStep === 1 && (
            <StepWrapper key="s1" custom={direction}>
              <h1 className="font-heading font-bold text-3xl text-text mb-6 px-6 pt-16">
                where are you?
              </h1>
              <div className="px-6 mb-4 relative">
                <Search size={16} className="absolute left-9 top-1/2 -translate-y-1/2 text-dim" />
                <input
                  className="search-input pl-10"
                  placeholder="search state..."
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto px-6 space-y-2 pb-8">
                {filteredStates.map((s) => (
                  <motion.button
                    key={s.name}
                    className={selectedState === s.name ? 'list-item-selected' : 'list-item'}
                    onClick={() => {
                      haptic.tap();
                      setSelectedState(s.name);
                      setStateSearch('');
                      setTimeout(goSignupNext, 200);
                    }}
                    {...pressScale}
                  >
                    {s.name}
                  </motion.button>
                ))}
              </div>
            </StepWrapper>
          )}

          {/* ── SIGNUP step 2 — city ─────────────────────────── */}
          {mode === 'signup' && signupStep === 2 && (
            <StepWrapper key="s2" custom={direction}>
              <h1 className="font-heading font-bold text-3xl text-text mb-1 px-6 pt-16">
                your city.
              </h1>
              <p className="text-muted text-sm font-body mb-6 px-6">{selectedState}</p>
              <div className="px-6 mb-4 relative">
                <Search size={16} className="absolute left-9 top-1/2 -translate-y-1/2 text-dim" />
                <input
                  className="search-input pl-10"
                  placeholder="search city..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto px-6 space-y-2 pb-8">
                {filteredCities.map((c) => (
                  <motion.button
                    key={c}
                    className={selectedCity === c ? 'list-item-selected' : 'list-item'}
                    onClick={() => {
                      haptic.tap();
                      setSelectedCity(c);
                      setCitySearch('');
                      setTimeout(goSignupNext, 200);
                    }}
                    {...pressScale}
                  >
                    {c}
                  </motion.button>
                ))}
              </div>
            </StepWrapper>
          )}

          {/* ── SIGNUP step 3 — role ─────────────────────────── */}
          {mode === 'signup' && signupStep === 3 && (
            <StepWrapper key="s3" custom={direction}>
              <h1 className="font-heading font-bold text-3xl text-text mb-8 px-6 pt-16">
                you are a...
              </h1>
              <div className="px-6 space-y-4">
                {(['creator', 'business'] as const).map((r) => (
                  <motion.button
                    key={r}
                    className={`w-full p-6 rounded-card border transition-all flex items-center gap-4 ${
                      role === r
                        ? 'bg-text border-text text-bg'
                        : 'bg-bg border-border text-text'
                    }`}
                    onClick={() => {
                      haptic.tap();
                      setRole(r);
                      setTimeout(goSignupNext, 250);
                    }}
                    whileTap={{ scale: 0.96 }}
                    transition={spring.default}
                  >
                    <span className="text-3xl">{r === 'creator' ? '*' : '🏢'}</span>
                    <div className="text-left">
                      <p className="font-heading font-bold text-lg capitalize">{r}</p>
                      <p className={`text-sm font-body ${role === r ? 'text-bg/70' : 'text-muted'}`}>
                        {r === 'creator'
                          ? 'create content, get paid'
                          : 'find creators, grow your brand'}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </StepWrapper>
          )}

          {/* ── SIGNUP step 4 — email ────────────────────────── */}
          {mode === 'signup' && signupStep === 4 && (
            <StepWrapper key="s4" custom={direction}>
              <div className="flex flex-col px-6 pt-16">
                <h1 className="font-heading font-bold text-3xl text-text mb-2">your email.</h1>
                <p className="text-muted text-sm font-body mb-8">
                  we'll send a 6-digit code to verify
                </p>
                <input
                  className="search-input mb-4"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                {error && <p style={{ color: '#FF3B30' }} className="text-xs font-mono mb-3">{error}</p>}
                <motion.button
                  className="pill-btn-primary w-full disabled:opacity-40"
                  disabled={!email.trim() || loading}
                  onClick={() => handleSendOtp(true)}
                  {...pressScale}
                >
                  {loading ? 'sending...' : 'send code'}
                </motion.button>
              </div>
            </StepWrapper>
          )}

          {/* ── SIGNUP step 5 — enter OTP ────────────────────── */}
          {mode === 'signup' && signupStep === 5 && (
            <StepWrapper key="s5" custom={direction}>
              <div className="flex flex-col items-center px-6 pt-20 text-center">
                <div className="w-16 h-16 rounded-full bg-elevated border border-border flex items-center justify-center mb-6">
                  <Mail size={26} className="text-text" />
                </div>
                <h1 className="font-heading font-bold text-3xl text-text mb-2">check your email.</h1>
                <p className="text-muted text-sm font-body mb-8 max-w-xs">
                  code sent to <span className="text-text font-medium">{email}</span>
                </p>
                <OtpField value={otpCode} onChange={setOtpCode} />
                {error && <p className="text-red-400 text-xs font-mono mt-3">{error}</p>}
                {otpSent && !error && (
                  <p className="text-text text-xs font-mono mt-3">✓ new code sent — check spam too</p>
                )}
                <motion.button
                  className="pill-btn-primary w-full mt-6 disabled:opacity-40"
                  disabled={otpCode.length !== 6 || loading}
                  onClick={() => handleVerifyOtp(true)}
                  {...pressScale}
                >
                  {loading ? 'verifying...' : 'verify code'}
                </motion.button>
                <button
                  className="text-dim text-xs font-mono mt-4"
                  onClick={() => handleSendOtp(true, true)}
                  disabled={loading}
                >
                  resend code
                </button>
              </div>
            </StepWrapper>
          )}

          {/* ── SIGNUP step 6 — username ─────────────────────── */}
          {mode === 'signup' && signupStep === 6 && (
            <StepWrapper key="s6" custom={direction}>
              <div className="flex flex-col px-6 pt-16">
                <h1 className="font-heading font-bold text-3xl text-text mb-2">pick a username.</h1>
                <p className="text-muted text-sm font-body mb-8">
                  this is how others will find you
                </p>
                <input
                  className="search-input mb-4"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.replace(/\s/g, '').toLowerCase())
                  }
                  autoFocus
                />
                {error && <p style={{ color: '#FF3B30' }} className="text-xs font-mono mb-3">{error}</p>}
                <motion.button
                  className="pill-btn-primary w-full disabled:opacity-40"
                  disabled={!username.trim() || loading}
                  onClick={handleSignupComplete}
                  {...pressScale}
                >
                  {loading ? 'creating account...' : "let's go. *"}
                </motion.button>
              </div>
            </StepWrapper>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ── 6-box OTP input ─────────────────────────────────────────
function OtpField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleKey = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === 'Backspace') {
      const next = value.slice(0, -1);
      onChange(next);
      const prev = document.getElementById(`otp-${idx - 1}`);
      if (prev) (prev as HTMLInputElement).focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return;
    const next = (value + char).slice(0, 6);
    onChange(next);
    if (idx < 5) {
      const nextEl = document.getElementById(`otp-${idx + 1}`);
      if (nextEl) (nextEl as HTMLInputElement).focus();
    }
  };

  return (
    <div className="flex gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          className="otp-input"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

function StepWrapper({
  children,
  custom,
}: {
  children: React.ReactNode;
  custom: number;
}) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      custom={custom}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={spring.default}
    >
      {children}
    </motion.div>
  );
}
