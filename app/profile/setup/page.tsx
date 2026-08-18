'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, type User } from '@/lib/auth';
import CreatorProfileForm from '@/components/creator-profile-form';
import BusinessProfileForm from '@/components/business-profile-form';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ProfileSetupPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser();
      if (!u) { router.replace('/'); return; }
      setUser(u);
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
      <header className="px-6 pt-14 pb-6">
        <h1 className="font-heading font-bold text-2xl text-text">set up profile.</h1>
        <p className="text-muted text-sm font-body mt-1">
          {user?.role === 'creator' ? 'tell brands who you are' : 'tell creators about your business'}
        </p>
      </header>
      <main className="px-6 pb-8">
        {user?.role === 'creator' ? (
          <CreatorProfileForm onSave={() => router.replace('/home')} />
        ) : (
          <BusinessProfileForm onSave={() => router.replace('/home')} />
        )}
      </main>
    </div>
  );
}
