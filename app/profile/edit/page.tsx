'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentUser, type User } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import CreatorProfileForm from '@/components/creator-profile-form';
import BusinessProfileForm from '@/components/business-profile-form';
import { haptic, pressScale } from '@/lib/haptics';

export const dynamic = 'force-dynamic';

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser();
      if (!u) { router.replace('/'); return; }
      setUser(u);

      if (u.role === 'creator') {
        const cp = await convex.query(api.users.getCreatorProfile, { userId: u._id });
        setInitialData(cp);
      } else if (u.role === 'business') {
        const bp = await convex.query(api.users.getBusinessProfile, { userId: u._id });
        setInitialData(bp);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="app-container bg-bg min-h-screen flex items-center justify-center">
        <div className="skeleton w-24 h-4 rounded" />
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
        <h1 className="font-heading font-bold text-2xl text-text">edit profile.</h1>
      </header>
      <main className="px-6 pb-8">
        {user?.role === 'creator' ? (
          <CreatorProfileForm
            initial={initialData ?? undefined}
            onSave={() => router.replace('/profile')}
            submitLabel="save changes"
          />
        ) : (
          <BusinessProfileForm
            initial={initialData ?? undefined}
            onSave={() => router.replace('/profile')}
            submitLabel="save changes"
          />
        )}
      </main>
    </div>
  );
}
