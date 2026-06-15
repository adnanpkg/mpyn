'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import { indianStates } from '@/lib/indian-data';
import { haptic, spring, pressScale } from '@/lib/haptics';
import { supabase } from '@/lib/supabase';
import OtpInput from '@/components/otp-input';

interface OnboardingProps {
  onComplete: () => void;
}

type AuthMode = 'welcome' | 'signup' | 'signin';
type SignupStep = 1 | 2 | 3 | 4 | 5 | 6;
type SigninStep = 1 | 2;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [signinStep, setSigninStep] = useState<SigninStep>(1);
  const [direction, setDirection] = useState(1);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [role, setRole] = useState<'creator' | 'business' | ''>('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const goSignupNext = useCallback(() => {
    setDirection(1);
    setSignupStep((s) => Math.min(s + 1, 6) as SignupStep);
  }, []);

  const goSignupBack = useCallback(() => {
    setDirection(-1);
    if (signupStep === 1) {
      setMode('welcome');
      return;
    }
    setSignupStep((s) => Math.max(s - 1, 1) as SignupStep);
  }, [signupStep]);

  const goSigninBack = useCallback(() => {
    setDirection(-1);
    if (signinStep === 1) {
      setMode('welcome');
      return;
    }
    setSigninStep(1);
    setOtp('');
  }, [signinStep]);

  const filteredStates = indianStates.filter((s) =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const stateData = indianStates.find((s) => s.name === selectedState);
  const filteredCities = (stateData?.cities ?? []).filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const sendOtp = async (isSignup: boolean) => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: isSignup },
      });
      if (otpError) throw otpError;
      haptic.success();
      if (isSignup) goSignupNext();
      else setSigninStep(2);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send code');
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (isSignup: boolean) => {
    if (!email || otp.length < 6) return;
    setLoading(true);
    setError('');
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (verifyError) throw verifyError;
      if (!data.user) throw new Error('Verification failed');

      if (isSignup) {
        haptic.success();
        goSignupNext();
      } else {
        haptic.success();
        onComplete();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid code');
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  const handleSignupComplete = async () => {
    if (!username) return;
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        role,
        state: selectedState,
        city: selectedCity,
        username,
        email,
      });
      if (profileError) throw profileError;

      haptic.success();
      onComplete();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Signup failed');
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
          {mode === 'welcome' && (
            <StepWrapper key="welcome" custom={direction}>
              <div className="flex flex-col items-center justify-center min-h-screen px-6">
                <span className="text-6xl mb-6">✳</span>
                <h1 className="font-heading font-bold text-4xl text-text mb-2">multiply.</h1>
                <p className="text-muted text-sm font-body mb-12 text-center">
                  connect creators with brands
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
                  already have an account? <span className="text-text underline">sign in</span>
                </motion.button>
              </div>
            </StepWrapper>
          )}

          {mode === 'signin' && signinStep === 1 && (
            <StepWrapper key="signin-email" custom={direction}>
              <h1 className="font-heading font-bold text-3xl text-text mb-2 px-6 pt-16">
                welcome back.
              </h1>
              <p className="text-muted text-sm font-body mb-8 px-6">
                enter your email to sign in
              </p>
              <div className="px-6 space-y-5">
                <input
                  className="search-input"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                {error && <p className="text-red-400 text-sm font-body">{error}</p>}
                <motion.button
                  className="pill-btn-primary w-full disabled:opacity-40"
                  disabled={!email || loading}
                  onClick={() => sendOtp(false)}
                  {...pressScale}
                >
                  {loading ? 'sending...' : 'send code'}
                </motion.button>
              </div>
            </StepWrapper>
          )}

          {mode === 'signin' && signinStep === 2 && (
            <StepWrapper key="signin-otp" custom={direction}>
              <h1 className="font-heading font-bold text-3xl text-text mb-2 px-6 pt-16">
                check your email.
              </h1>
              <p className="text-muted text-sm font-body mb-8 px-6">
                we sent a 6-digit code to {email}
              </p>
              <div className="px-6 space-y-6">
                <OtpInput value={otp} onChange={setOtp} />
                {error && <p className="text-red-400 text-sm font-body text-center">{error}</p>}
                <motion.button
                  className="pill-btn-primary w-full disabled:opacity-40"
                  disabled={otp.length < 6 || loading}
                  onClick={() => verifyOtp(false)}
                  {...pressScale}
                >
                  {loading ? 'verifying...' : 'verify & sign in'}
                </motion.button>
                <button
                  className="text-dim text-sm font-body w-full text-center"
                  onClick={() => { setOtp(''); sendOtp(false); }}
                >
                  resend code
                </button>
              </div>
            </StepWrapper>
          )}

          {mode === 'signup' && signupStep === 1 && (
            <StepWrapper key="s1" custom={direction}>
              <h1 className="font-heading font-bold text-3xl text-text mb-6 px-6 pt-16">
                where are you?
              </h1>
              <div className="px-6 mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                  <input
                    className="search-input pl-10"
                    placeholder="Search state..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                  />
                </div>
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

          {mode === 'signup' && signupStep === 2 && (
            <StepWrapper key="s2" custom={direction}>
              <h1 className="font-heading font-bold text-3xl text-text mb-2 px-6 pt-16">
                your city.
              </h1>
              <p className="text-muted text-sm font-body mb-6 px-6">{selectedState}</p>
              <div className="px-6 mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                  <input
                    className="search-input pl-10"
                    placeholder="Search city..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                  />
                </div>
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
                      role === r ? 'bg-text border-text text-bg' : 'bg-bg border-border text-text'
                    }`}
                    onClick={() => {
                      haptic.tap();
                      setRole(r);
                      setTimeout(goSignupNext, 250);
                    }}
                    whileTap={{ scale: 0.96 }}
                    animate={role === r ? { scale: 1.02 } : { scale: 1 }}
                    transition={spring.default}
                  >
                    <span className="text-3xl">{r === 'creator' ? '✳' : '🏢'}</span>
                    <div className="text-left">
                      <p className="font-heading font-bold text-lg capitalize">{r}</p>
                      <p className={`text-sm font-body ${role === r ? 'text-bg/70' : 'text-muted'}`}>
                        {r === 'creator' ? 'Create and share content' : 'Grow your business'}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </StepWrapper>
          )}

          {mode === 'signup' && signupStep === 4 && (
            <StepWrapper key="s4-email" custom={direction}>
              <h1 className="font-heading font-bold text-3xl text-text mb-2 px-6 pt-16">
                your email.
              </h1>
              <p className="text-muted text-sm font-body mb-8 px-6">
                we&apos;ll send you a verification code
              </p>
              <div className="px-6 space-y-5">
                <input
                  className="search-input"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error && <p className="text-red-400 text-sm font-body">{error}</p>}
                <motion.button
                  className="pill-btn-primary w-full disabled:opacity-40"
                  disabled={!email || loading}
                  onClick={() => sendOtp(true)}
                  {...pressScale}
                >
                  {loading ? 'sending...' : 'send code'}
                </motion.button>
              </div>
            </StepWrapper>
          )}

          {mode === 'signup' && signupStep === 5 && (
            <StepWrapper key="s5-otp" custom={direction}>
              <h1 className="font-heading font-bold text-3xl text-text mb-2 px-6 pt-16">
                check your email.
              </h1>
              <p className="text-muted text-sm font-body mb-8 px-6">
                we sent a 6-digit code to {email}
              </p>
              <div className="px-6 space-y-6">
                <OtpInput value={otp} onChange={setOtp} />
                {error && <p className="text-red-400 text-sm font-body text-center">{error}</p>}
                <motion.button
                  className="pill-btn-primary w-full disabled:opacity-40"
                  disabled={otp.length < 6 || loading}
                  onClick={() => verifyOtp(true)}
                  {...pressScale}
                >
                  {loading ? 'verifying...' : 'verify email'}
                </motion.button>
                <button
                  className="text-dim text-sm font-body w-full text-center"
                  onClick={() => { setOtp(''); sendOtp(true); }}
                >
                  resend code
                </button>
              </div>
            </StepWrapper>
          )}

          {mode === 'signup' && signupStep === 6 && (
            <StepWrapper key="s6-username" custom={direction}>
              <h1 className="font-heading font-bold text-3xl text-text mb-2 px-6 pt-16">
                pick a username.
              </h1>
              <p className="text-muted text-sm font-body mb-8 px-6">
                this is how others will find you
              </p>
              <div className="px-6 space-y-5">
                <input
                  className="search-input"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                  autoFocus
                />
                {error && <p className="text-red-400 text-sm font-body">{error}</p>}
                <motion.button
                  className="pill-btn-primary w-full disabled:opacity-40"
                  disabled={!username || loading}
                  onClick={handleSignupComplete}
                  {...pressScale}
                >
                  {loading ? 'creating...' : 'create account'}
                </motion.button>
              </div>
            </StepWrapper>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepWrapper({ children, custom }: { children: React.ReactNode; custom: number }) {
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
