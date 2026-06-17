'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { EmailOtpType } from '@supabase/supabase-js';

const SplashScreen = dynamic(() => import('@/components/splash-screen'), {
  ssr: false,
});

const Onboarding = dynamic(() => import('@/components/onboarding'), {
  ssr: false,
});

const MainApp = dynamic(() => import('@/components/main-app'), {
  ssr: false,
});

export default function App() {
  const [phase, setPhase] = useState<'splash' | 'onboarding' | 'app'>('splash');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get('token_hash');
      const type = params.get('type') as EmailOtpType | null;
      const queryIntent = params.get('auth_intent');

      if (queryIntent === 'signup' || queryIntent === 'signin') {
        window.localStorage.setItem('auth_intent', queryIntent);
      }

      // Handle magic-link style redirects so users who click email links are signed in.
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash: tokenHash,
        });
        if (!error) {
          const retainedIntent = queryIntent === 'signup' || queryIntent === 'signin' ? queryIntent : null;
          const nextUrl = retainedIntent
            ? `${window.location.pathname}?auth_intent=${retainedIntent}`
            : window.location.pathname;
          window.history.replaceState({}, '', nextUrl);
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const intent = queryIntent ?? window.localStorage.getItem('auth_intent');
        setPhase(intent === 'signup' ? 'onboarding' : 'app');
      }
      setLoading(false);
    };
    checkSession();

    if (!isSupabaseConfigured) {
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        const intent = typeof window !== 'undefined' ? window.localStorage.getItem('auth_intent') : null;
        setPhase(intent === 'signup' ? 'onboarding' : 'app');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-bg flex items-center justify-center">
        <div className="skeleton w-24 h-24 rounded-full" />
      </div>
    );
  }

  if (phase === 'splash') {
    return <SplashScreen onComplete={() => setPhase('onboarding')} />;
  }

  if (phase === 'onboarding') {
    return <Onboarding onComplete={() => setPhase('app')} />;
  }

  return <MainApp />;
}
