'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import TabBar from '@/components/tab-bar';
import { supabase } from '@/lib/supabase';
import { getProfile, getCreatorProfile, needsCreatorSetup } from '@/lib/profile';
import { haptic, pressScale } from '@/lib/haptics';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/');
        return;
      }

      const profile = await getProfile(user.id);
      if (!profile) {
        router.replace('/');
        return;
      }

      const creatorProfile = await getCreatorProfile(user.id);
      if (needsCreatorSetup(profile, creatorProfile)) {
        router.replace('/profile/setup');
        return;
      }

      setUsername(profile.username ?? 'creator');
      setLoading(false);
    };
    check();
  }, [router]);

  if (loading) {
    return (
      <div className="app-container bg-bg min-h-screen flex items-center justify-center">
        <div className="skeleton w-24 h-4" />
      </div>
    );
  }

  return (
    <div className="app-container bg-bg pb-20 min-h-screen relative">
      <header className="px-6 pt-14 pb-6">
        <h1 className="font-heading font-bold text-2xl text-text">multiply.</h1>
        <p className="text-muted text-sm font-body mt-1">hey, @{username}</p>
      </header>

      <main className="px-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-4xl mb-4">✳</span>
          <p className="font-heading font-bold text-lg text-text mb-2">your feed is empty</p>
          <p className="text-muted text-sm font-body max-w-[240px]">
            gigs and opportunities will show up here
          </p>
        </div>
      </main>

      <motion.button
        className="absolute bottom-24 right-6 z-30 w-14 h-14 rounded-full bg-text flex items-center justify-center shadow-lg"
        onClick={() => { haptic.tap(); router.push('/create-gig'); }}
        {...pressScale}
      >
        <Plus size={24} className="text-bg" strokeWidth={2.5} />
      </motion.button>

      <TabBar />
    </div>
  );
}
