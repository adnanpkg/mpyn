'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { haptic, pressScale } from '@/lib/haptics';
import { getProfile } from '@/lib/profile';

export default function CreateGigPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [charge, setCharge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const chargeNum = parseInt(charge, 10);
  const isValid = title.trim() && chargeNum >= 500;

  // Platform cut formula from context.md for standard user:
  // ₹500–₹2,000 -> ₹19 cut, ₹2,001–₹10,000 -> ₹35 cut, ₹10,001+ -> ₹50 cut
  const getPlatformCut = (amount: number) => {
    if (isNaN(amount) || amount < 500) return 0;
    if (amount <= 2000) return 19;
    if (amount <= 10000) return 35;
    return 50;
  };

  const platformCut = getPlatformCut(chargeNum);
  const earnings = chargeNum > 0 ? chargeNum - platformCut : 0;

  const handleCreate = async () => {
    if (!isValid) {
      if (chargeNum < 500) {
        setError('minimum gig is ₹500 bro');
      }
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const profile = await getProfile(user.id);
      if (!profile) {
        throw new Error('Complete signup/profile first, then create a gig.');
      }

      const { error: insertError } = await supabase.from('gigs').insert({
        creator_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        charge: chargeNum,
        status: 'open',
      });


      if (insertError) {
        throw new Error(insertError.message || 'Failed to create gig');
      }
      haptic.success();
      router.replace('/gigs');
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('[create-gig] create failed:', e);
      setError(e instanceof Error ? e.message : 'Failed to create gig');
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
        <h1 className="font-heading font-bold text-2xl text-text">new gig</h1>
      </header>

      <main className="px-6 space-y-5 pb-8">
        <div>
          <label className="text-muted text-xs font-mono mb-2 block">title</label>
          <input
            className="search-input"
            placeholder="e.g. Instagram Reel for fashion brand"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="text-muted text-xs font-mono mb-2 block">description</label>
          <textarea
            className="search-input min-h-[120px] resize-none"
            placeholder="What does this gig involve?"
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
              <span className="text-text">-₹{platformCut}</span>
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
          {loading ? 'creating...' : 'confirm gig.'}
        </motion.button>
      </main>
    </div>
  );

}
