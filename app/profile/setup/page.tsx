'use client';

import { useRouter } from 'next/navigation';
import CreatorProfileForm from '@/components/creator-profile-form';

export default function ProfileSetupPage() {
  const router = useRouter();

  return (
    <div className="app-container bg-bg min-h-screen">
      <header className="px-6 pt-14 pb-6">
        <h1 className="font-heading font-bold text-2xl text-text">set up profile</h1>
        <p className="text-muted text-sm font-body mt-1">
          tell brands who you are
        </p>
      </header>
      <main className="px-6 pb-8">
        <CreatorProfileForm onSave={() => router.replace('/home')} />
      </main>
    </div>
  );
}
