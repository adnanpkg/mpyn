'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { pressScale, haptic } from '@/lib/haptics';

export default function GiveProPage() {
  const [username, setUsername] = useState('pkgmon');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const giveProSubscription = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    haptic.tap();

    try {
      const res = await convex.mutation(api.admin.giveProSubscription, {
        username,
      });
      setResult(res);
      haptic.success();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container bg-bg min-h-screen p-6 pt-20">
      <div className="max-w-md mx-auto">
        <h1 className="font-heading font-bold text-3xl text-text mb-2">give pro.</h1>
        <p className="text-muted text-sm font-mono mb-8">grant pro subscription to user</p>

        <div className="space-y-4">
          <input
            className="w-full bg-surface px-3 py-2.5 rounded-[14px] text-text outline-none text-sm"
            placeholder="username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <motion.button
            className="w-full py-3 bg-text text-bg rounded-full font-heading font-bold disabled:opacity-50"
            onClick={giveProSubscription}
            disabled={loading || !username.trim()}
            {...pressScale}
          >
            {loading ? 'giving pro...' : 'give pro subscription'}
          </motion.button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 rounded-card">
            <p className="text-red-400 text-sm font-mono">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-500/10 rounded-card">
            <p className="text-green-400 font-heading font-bold mb-2">✓ Pro granted!</p>
            <div className="text-xs font-mono text-green-300 space-y-1">
              <p>👤 User: {result.user}</p>
              <p>📅 Pro until: {result.proUntil}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
