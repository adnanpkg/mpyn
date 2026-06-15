'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MainApp() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
    <div className="fixed inset-0 bg-bg flex items-center justify-center">
      <div className="skeleton w-24 h-4" />
    </div>
  );
}
