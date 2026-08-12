'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentUser } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { haptic, pressScale } from '@/lib/haptics';

function calcCut(charge: number, isPro: boolean): number {
  if (isPro) {
    if (charge <= 2000) return 15;
    if (charge <= 10000) return 28;
    return 40;
  }
  if (charge <= 2000) return 19;
  if (charge <= 10000) return 35;
  return 50;
}

export default function CreateGigPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [charge, setCharge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const chargeNum = parseInt(charge, 10);
  const isValid = title.trim().length > 0 && chargeNum >= 500;
  const cut = isNaN(chargeNum) || chargeNum < 500 ? 0 : calcCut(chargeNum, false);
  const earnings = chargeNum > 0 ? chargeNum - cut : 0;

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
        isPro: u.isPro ?? false,
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
          <div className="p-4 rounded-card bg-surface border border-border space-y-2">
            <div className="flex justify-between text-xs font-mono text-muted">
              <span>gig price</span>
              <span className="text-text">₹{chargeNum}</span>
            </div>
            <div className="flex justify-between text-xs font-mono text-muted">
              <span>multiply. cut</span>
              <span className="text-text">−₹{cut}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between text-sm font-mono font-bold text-text">
              <span>you receive</span>
              <span>₹{earnings}</span>
            </div>
          </div>
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
