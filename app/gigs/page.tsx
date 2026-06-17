'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/tab-bar';
import { supabase } from '@/lib/supabase';

interface Gig {
  id: string;
  title: string;
  description: string | null;
  charge: number;
  status: string;
}

export default function GigsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/');
        return;
      }

      const { data, error: loadError } = await supabase
        .from('gigs')
        .select('id, title, description, charge, status')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (loadError) {
        setError(loadError.message || 'Failed to load gigs');
        setGigs([]);
        setLoading(false);
        return;
      }

      setGigs(data ?? []);
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
    <div className="app-container bg-bg pb-20 min-h-screen">
      <header className="px-6 pt-14 pb-6">
        <h1 className="font-heading font-bold text-2xl text-text">Gigs</h1>
      </header>
      <main className="px-6">
        {error && (
          <p className="text-red-400 text-sm font-body mb-4">{error}</p>
        )}
        {gigs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-muted text-sm font-body">no gigs yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gigs.map((gig) => (
              <div
                key={gig.id}
                className="p-4 rounded-card bg-surface border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-heading font-bold text-text text-sm">{gig.title}</h3>
                  <span className="text-text font-mono text-sm">₹{gig.charge}</span>
                </div>
                {gig.description && (
                  <p className="text-muted text-xs font-body line-clamp-2">{gig.description}</p>
                )}
                <span className="text-dim text-[10px] font-mono mt-2 inline-block capitalize">
                  {gig.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
      <TabBar />
    </div>
  );
}
