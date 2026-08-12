'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getCurrentUser, type User } from '@/lib/auth';

const SplashScreen = dynamic(() => import('@/components/splash-screen'), { ssr: false });
const Onboarding = dynamic(() => import('@/components/onboarding'), { ssr: false });
const MainApp = dynamic(() => import('@/components/main-app'), { ssr: false });

export default function App() {
  const [phase, setPhase] = useState<'splash' | 'onboarding' | 'app'>('splash');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setPhase('onboarding');
        } else if (!user.username || !user.role || !user.city) {
          // Signed in but onboarding incomplete
          setPhase('onboarding');
        } else {
          setPhase('app');
        }
      } catch {
        setPhase('onboarding');
      } finally {
        setLoading(false);
      }
    };
    check();
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
