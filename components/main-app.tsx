'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfile, getCreatorProfile, needsCreatorSetup } from '@/lib/profile';

export default function MainApp() {
  const router = useRouter();

  useEffect(() => {
    const route = async () => {
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

      if (needsCreatorSetup(profile, await getCreatorProfile(user.id))) {
        router.replace('/profile/setup');
        return;
      }

      router.replace('/home');
    };
    route();
  }, [router]);

  return (
    <div className="fixed inset-0 bg-bg flex items-center justify-center">
      <div className="skeleton w-24 h-4" />
    </div>
  );
}
