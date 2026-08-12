'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import FeeCalculator from '@/components/fee-calculator';
import { getCurrentUser } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { haptic, pressScale } from '@/lib/haptics';

function calcPlatformFee(charge: number, isPro: boolean): number {
  if (isPro) return 0; // Pro users: zero platform fee
  return Math.round(charge * 0.05); // Free users: 5% platform fee
}

export default function CreateGigPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [charge, setCharge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  // Load user on mount
  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const chargeNum = parseInt(charge, 10);
  const isValid = title.trim().length > 0 && chargeNum >= 500;
  const isPro = user?.isPro && user?.proExpiresAt && user?.proExpiresAt > Date.now();

  const handleCreate = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      const u = await getCurrentUser();
      if (!u) throw new Error('not authenticated');

      await convex.mutation(api.gigs.create, {
        creatorId: u._id,
        title: title.trim(),
        description: description.trim() || undefined,
        charge: chargeNum,
        isPro: u.isPro && u.proExpiresAt && u.proExpiresAt > Date.now(),
      });

      haptic.success();
      router.replace('/gigs');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'failed to create gig');
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="font-heading font-bold text-2xl text-text">new gig.</h1>
      </header>

      <main className="px-6 space-y-5 pb-8">
        <div>
          <label className="text-muted text-xs font-mono mb-2 block">title</label>
          <input
            className="search-input"
            placeholder="e.g. instagram reel for local restaurant"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="text-muted text-xs font-mono mb-2 block">description (optional)</label>
          <textarea
            className="search-input min-h-[120px] resize-none"
            placeholder="what does this gig involve?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="text-muted text-xs font-mono mb-2 block">charge (min ₹500)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">₹</span>
            <input
              className="search-input pl-8"
              type="number"
              min={500}
              placeholder="500"
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
            />
          </div>
          {chargeNum > 0 && chargeNum < 500 && (
            <p className="text-red-400 text-xs font-mono mt-1">minimum gig is ₹500 bro</p>
          )}
        </div>

        {chargeNum >= 500 && (
          <FeeCalculator 
            amount={chargeNum} 
            isPro={isPro}
          />
        )}

        {error && <p className="text-red-400 text-sm font-body">{error}</p>}

        <motion.button
          className="pill-btn-primary w-full disabled:opacity-40"
          disabled={!isValid || loading}
          onClick={handleCreate}
          {...pressScale}
        >
          {loading ? 'creating...' : 'post gig. ✳'}
        </motion.button>
      </main>
    </div>
  );
}
