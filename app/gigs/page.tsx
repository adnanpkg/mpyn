'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, Trash2, AlertCircle, PhoneCall, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import TabBar from '@/components/tab-bar';
import PaymentStatus from '@/components/payment-status';
import GigCompletion from '@/components/gig-completion';
import { getCurrentUser, type User } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { haptic, pressScale, spring } from '@/lib/haptics';

interface Gig {
  _id: string;
  title: string;
  description?: string;
  charge: number;
  cut: number;
  status: string;
  creatorId: string;
  businessId?: string;
  creatorMarkedComplete?: boolean;
  businessMarkedComplete?: boolean;
  createdAt: number;
}

export default function GigsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGigs = async (u: User) => {
    const data = await convex.query(api.gigs.getForUser, { userId: u._id });
    setGigs(data as Gig[]);
  };

  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u) { router.replace('/'); return; }
      setUser(u);
      await loadGigs(u);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleDelete = async (gigId: string) => {
    if (!user) return;
    if (!window.confirm('delete this gig? this cannot be undone.')) return;
    haptic.heavy();
    setError('');
    try {
      await convex.mutation(api.gigs.remove, {
        gigId: gigId as any,
        userId: user._id,
      });
      setGigs((prev) => prev.filter((g) => g._id !== gigId));
      haptic.success();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'failed to delete');
      haptic.error();
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
        <motion.button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface text-xs font-mono text-text hover:bg-elevated transition-colors"
          onClick={() => {
            haptic.tap();
            window.open('https://ig.me/m/adnan.pkg', '_blank');
          }}
          {...pressScale}
        >
          <PhoneCall size={12} />
          support
        </motion.button>
      </header>

      <main className="px-6">
        {error && <p className="text-red-400 text-xs font-mono mb-4">{error}</p>}

        {gigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-3">*</span>
            <p className="font-heading font-bold text-base text-text mb-1">no active gigs</p>
            <p className="text-muted text-xs font-body max-w-[220px]">
              when you confirm deals, they'll be tracked here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {gigs.map((gig) => {
              const isCreator = gig.creatorId === user?._id;
              const isBusiness = gig.businessId === user?._id;
              const isCompleted = gig.status === 'completed';
              const isDisputed = gig.status === 'disputed';

              return (
                <div
                  key={gig._id}
                  className="p-4 rounded-card bg-surface border border-border space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-text text-base">{gig.title}</h3>
                      <div className="mt-2">
                        <PaymentStatus
                          status={gig.status}
                          amount={gig.charge}
                          paymentMode={(gig as any).paymentMode}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-text font-mono font-bold text-sm bg-elevated px-2.5 py-1 rounded-full border border-border">
                        ₹{gig.charge}
                      </span>
                      {isCreator && gig.status === 'open' && (
                        <motion.button
                          className="p-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20"
                          onClick={() => handleDelete(gig._id)}
                          {...pressScale}
                          title="delete gig"
                        >
                          <Trash2 size={12} />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {gig.description && (
                    <p className="text-muted text-xs font-body line-clamp-2">{gig.description}</p>
                  )}

                  {/* Platform fee breakdown */}
                  {!isCompleted && (
                    <div className="text-[11px] font-mono text-dim flex gap-3">
                      <span>platform fee: ₹{gig.cut || (gig as any).platformFee || Math.round(gig.charge * 0.05)}</span>
                      <span>creator receives: ₹{gig.charge - (gig.cut || (gig as any).platformFee || Math.round(gig.charge * 0.05))}</span>
                    </div>
                  )}

                  {/* Gig completion flow */}
                  <GigCompletion
                    gig={gig}
                    currentUserId={user?._id as string}
                    onStatusUpdate={() => {
                      // Refresh gigs after status update
                      window.location.reload();
                    }}
                  />

                  <div className="pt-1 flex justify-end">
                    <motion.button
                      onClick={() => {
                        haptic.tap();
                        window.open('https://ig.me/m/adnan.pkg', '_blank');
                      }}
                      className="text-[10px] font-mono text-dim hover:text-text flex items-center gap-1"
                      {...pressScale}
                    >
                      <AlertCircle size={10} />
                      issue? dm support
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <motion.button
        className="fixed bottom-24 right-6 z-30 w-14 h-14 rounded-full bg-text text-bg flex items-center justify-center shadow-2xl border border-bg"
        onClick={() => { haptic.tap(); router.push('/create-gig'); }}
        {...pressScale}
      >
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>

      <TabBar />
    </div>
  );
}
