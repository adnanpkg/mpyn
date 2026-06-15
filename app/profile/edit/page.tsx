'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import CreatorProfileForm from '@/components/creator-profile-form';
import { supabase } from '@/lib/supabase';
import { getCreatorProfile, type CreatorProfile } from '@/lib/profile';
import { haptic, pressScale } from '@/lib/haptics';

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/');
        return;
      }
      const cp = await getCreatorProfile(user.id);
      setProfile(cp);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="app-container bg-bg min-h-screen flex items-center justify-center">
        <div className="skeleton w-24 h-4" />
      </div>
    );
  }

  return (
    <div className="app-container bg-bg min-h-screen">
      <header className="px-6 pt-14 pb-6 flex items-center gap-3">
        <motion.button
          className="p-2 -ml-2 text-dim"
          onClick={() => { haptic.tap(); router.back(); }}
          {...pressScale}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="font-heading font-bold text-2xl text-text">edit profile</h1>
      </header>
      <main className="px-6 pb-8">
        <CreatorProfileForm
          initial={{
            instagram_handle: profile?.instagram_handle ?? '',
            bio: profile?.bio ?? '',
            content_categories: profile?.content_categories ?? [],
            gig_charge: profile?.gig_charge ?? undefined,
            portfolio_url: profile?.portfolio_url ?? '',
          }}
          onSave={() => router.replace('/profile')}
          submitLabel="save changes"
        />
      </main>
    </div>
  );
}
