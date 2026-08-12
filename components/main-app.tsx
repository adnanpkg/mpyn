'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';

export default function MainApp() {
  const router = useRouter();

  useEffect(() => {
    const route = async () => {
      const user = await getCurrentUser();
      if (!user) { router.replace('/'); return; }

      if (!user.username || !user.role || !user.city) {
        // Profile incomplete — send back to onboarding
        router.replace('/');
        return;
      }

      if (user.role === 'creator') {
        // Check if creator profile is complete
        router.replace('/home');
      } else {
        router.replace('/home');
      }
    };
    route();
  }, [router]);

  return (
    <div className="fixed inset-0 bg-bg flex items-center justify-center">
      <div className="skeleton w-24 h-4 rounded" />
    </div>
  );
}
