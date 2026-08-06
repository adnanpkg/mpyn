'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneCall, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import TabBar from '@/components/tab-bar';
import { supabase } from '@/lib/supabase';
import { haptic, pressScale } from '@/lib/haptics';
import { motion } from 'framer-motion';

interface Gig {
  id: string;
  title: string;
  description: string | null;
  price?: number;
  charge?: number;
  cut?: number;
  status: 'agreed' | 'in_progress' | 'pending_completion' | 'completed' | 'disputed';
  creator_marked_complete?: boolean;
  business_marked_complete?: boolean;
}

export default function GigsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/');
        return;
      }
      setUserId(user.id);

      const { data, error: loadError } = await supabase
        .from('gigs')
        .select('*')
        .or(`creator_id.eq.${user.id},business_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (loadError) {
        setError(loadError.message || 'Failed to load gigs');
        setGigs([]);
      } else {
        setGigs(data ?? []);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const handleMarkComplete = async (gig: Gig) => {
    haptic.heavy();
    try {
      const isCreator = true; // Default fallback to user state
      const updatePayload: Partial<Gig> = isCreator
        ? { creator_marked_complete: true }
        : { business_marked_complete: true };

      const bothComplete =
        (isCreator && gig.business_marked_complete) || (!isCreator && gig.creator_marked_complete);

      if (bothComplete) {
        updatePayload.status = 'completed';
      } else {
        updatePayload.status = 'pending_completion';
      }

      const { error: updateErr } = await supabase
        .from('gigs')
        .update(updatePayload)
        .eq('id', gig.id);

      if (updateErr) throw updateErr;

      setGigs((prev) =>
        prev.map((g) => (g.id === gig.id ? { ...g, ...updatePayload } : g))
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update gig status');
    }
  };

  if (loading) {
    return (
      <div className="app-container bg-bg min-h-screen p-6 space-y-4 pt-16">
        <div className="skeleton w-24 h-6 rounded" />
        <div className="skeleton w-full h-28 rounded-card" />
        <div className="skeleton w-full h-28 rounded-card" />
      </div>
    );
  }

  return (
    <div className="app-container bg-bg pb-24 min-h-screen">
      <header className="px-6 pt-14 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl text-text">gigs.</h1>
          <p className="text-muted text-xs font-mono">order tracking & status</p>
        </div>
        
        {/* Customer Care Button */}
        <a
          href="tel:+919876543210"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-mono text-text hover:bg-elevated transition-all"
          onClick={() => haptic.tap()}
        >
          <PhoneCall size={12} className="text-text" />
          <span>support</span>
        </a>
      </header>

      <main className="px-6">
        {error && <p className="text-red-400 text-xs font-mono mb-4">{error}</p>}
        {gigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-3">✳</span>
            <p className="font-heading font-bold text-base text-text mb-1">no active gigs</p>
            <p className="text-muted text-xs font-body max-w-[220px]">
              when you confirm deals, orders will be tracked here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {gigs.map((gig) => {
              const amount = gig.price || gig.charge || 0;
              const isCompleted = gig.status === 'completed';
              const isPending = gig.status === 'pending_completion';

              return (
                <div
                  key={gig.id}
                  className="p-4 rounded-card bg-surface border border-border space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-text text-base">{gig.title}</h3>
                      <p className="text-muted text-xs font-mono mt-0.5 capitalize flex items-center gap-1">
                        {isCompleted ? (
                          <CheckCircle2 size={12} className="text-text" />
                        ) : (
                          <Clock size={12} className="text-muted" />
                        )}
                        status: <span className="text-text font-bold">{gig.status.replace('_', ' ')}</span>
                      </p>
                    </div>
                    <span className="text-text font-mono font-bold text-sm bg-elevated px-2.5 py-1 rounded-full border border-border">
                      ₹{amount}
                    </span>
                  </div>

                  {gig.description && (
                    <p className="text-muted text-xs font-body line-clamp-2">{gig.description}</p>
                  )}

                  {/* Dual Completion Button */}
                  {!isCompleted && (
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] font-mono text-dim">
                        {gig.creator_marked_complete ? 'you marked posted' : 'awaiting completion'}
                      </span>

                      <motion.button
                        className="px-3 py-1.5 rounded-full bg-text text-bg font-mono text-xs font-bold disabled:opacity-40"
                        disabled={gig.creator_marked_complete}
                        onClick={() => handleMarkComplete(gig)}
                        {...pressScale}
                      >
                        {gig.creator_marked_complete ? "posted! waiting..." : "i've posted it."}
                      </motion.button>
                    </div>
                  )}

                  {/* Customer Care Dispute note */}
                  <div className="pt-2 border-t border-border/50 flex justify-end">
                    <a
                      href="tel:+919876543210"
                      className="text-[10px] font-mono text-dim hover:text-text flex items-center gap-1"
                    >
                      <AlertCircle size={10} />
                      issue with this gig? call customer care
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <TabBar />
    </div>
  );
}

