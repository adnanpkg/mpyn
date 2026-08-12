'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/tab-bar';
import { getCurrentUser } from '@/lib/auth';
import { haptic } from '@/lib/haptics';

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await getCurrentUser();
        if (!u) {
          router.replace('/');
          return;
        }
      } catch (err) {
        console.error('Failed to initialize:', err);
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="app-container bg-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted font-mono text-sm">loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container bg-bg min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 font-mono text-xs mb-2">error</p>
          <p className="text-muted text-xs">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-text text-bg rounded-lg text-xs font-mono"
          >
            retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container bg-bg min-h-screen pb-24">
      <header className="px-6 pt-14 pb-4">
        <h1 className="font-heading font-bold text-3xl text-text">messages.</h1>
        <p className="text-muted text-xs font-mono">conversations & deals</p>
      </header>

      <main className="px-6 space-y-3">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-heading font-bold text-base text-text mb-1">no messages yet</p>
          <p className="text-muted text-xs font-body max-w-[220px]">
            tap "chat & deal" on any profile in your home feed to start a conversation.
          </p>
        </div>
      </main>

      <TabBar />
    </div>
  );
}
