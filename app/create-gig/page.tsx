'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { haptic, pressScale } from '@/lib/haptics';

export default function CreateGigPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [charge, setCharge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const chargeNum = parseInt(charge, 10);
  const isValid = title.trim() && chargeNum >= 100;

  const handleCreate = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: insertError } = await supabase.from('gigs').insert({
        creator_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        charge: chargeNum,
      });

      if (insertError) throw insertError;
      haptic.success();
      router.replace('/gigs');
    } catch (e: unknown) {
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
          <label className="text-muted text-xs font-mono mb-2 block">charge (min ₹100)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">₹</span>
            <input
              className="search-input pl-8"
              type="number"
              min={100}
              placeholder="500"
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm font-body">{error}</p>}

        <motion.button
          className="pill-btn-primary w-full disabled:opacity-40"
          disabled={!isValid || loading}
          onClick={handleCreate}
          {...pressScale}
        >
          {loading ? 'creating...' : 'create gig'}
        </motion.button>
      </main>
    </div>
  );
}
