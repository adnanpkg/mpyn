'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';

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
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setPhase('app');
      }
      setLoading(false);
    };
    checkSession();
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
