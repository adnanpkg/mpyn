'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import { indianStates } from '@/lib/indian-data';
import { haptic, spring, pressScale } from '@/lib/haptics';
import { supabase } from '@/lib/supabase';

interface OnboardingProps {
  onComplete: () => void;
}

type Step = 1 | 2 | 3 | 4;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [role, setRole] = useState<'creator' | 'business' | ''>('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 4) as Step);
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1) as Step);
  }, []);

  const filteredStates = indianStates.filter((s) =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const stateData = indianStates.find((s) => s.name === selectedState);
  const filteredCities = (stateData?.cities ?? []).filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleSignup = async () => {
    if (!email || !username) return;
    setLoading(true);
    setError('');
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password: username + Date.now(),
        options: {
          data: { username, role, state: selectedState, city: selectedCity },
        },
      });
      if (signupError) throw signupError;
      const userId = data.user?.id;
      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          role,
          state: selectedState,
          city: selectedCity,
          username,
          email,
        });
      }
      haptic.success();
      onComplete();
    } catch (e: any) {
      setError(e.message || 'Signup failed');
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container flex flex-col min-h-screen bg-bg">
      <div className="relative flex-1 overflow-hidden">
        {step > 1 && (
          <motion.button
            className="absolute top-4 left-4 z-20 p-2 text-dim"
            onClick={() => { haptic.tap(); goBack(); }}
            {...pressScale}
          >
            <ArrowLeft size={20} />
          </motion.button>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
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
                      setTimeout(goNext, 200);
                    }}
                    {...pressScale}
                  >
                    {s.name}
                  </motion.button>
                ))}
                {filteredStates.length === 0 && (
                  <p className="text-dim text-sm text-center py-8">No states found</p>
                )}
              </div>
            </StepWrapper>
          )}

          {step === 2 && (
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
                      setTimeout(goNext, 200);
                    }}
                    {...pressScale}
                  >
                    {c}
                  </motion.button>
                ))}
                {filteredCities.length === 0 && (
                  <p className="text-dim text-sm text-center py-8">No cities found</p>
                )}
              </div>
            </StepWrapper>
          )}

          {step === 3 && (
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
                      setTimeout(goNext, 250);
                    }}
                    whileTap={{ scale: 0.96 }}
                    animate={role === r ? { scale: 1.02 } : { scale: 1 }}
                    transition={spring.default}
                  >
                    <span className="text-3xl">
                      {r === 'creator' ? '✳' : '🏢'}
                    </span>
                    <div className="text-left">
                      <p className="font-heading font-bold text-lg capitalize">{r}</p>
                      <p className={`text-sm font-body ${role === r ? 'text-bg/70' : 'text-muted'}`}>
                        {r === 'creator'
                          ? 'Create and share content'
                          : 'Grow your business'}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </StepWrapper>
          )}

          {step === 4 && (
            <StepWrapper key="s4" custom={direction}>
              <h1 className="font-heading font-bold text-3xl text-text mb-8 px-6 pt-16">
                let&apos;s go.
              </h1>
              <div className="px-6 space-y-5">
                <input
                  className="search-input"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  className="search-input"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {error && <p className="text-red-400 text-sm font-body">{error}</p>}
                <motion.button
                  className="pill-btn-primary w-full disabled:opacity-40"
                  disabled={!email || !username || loading}
                  onClick={handleSignup}
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
