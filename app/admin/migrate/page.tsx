'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { pressScale, haptic } from '@/lib/haptics';

export default function MigrationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const runMigration = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    haptic.tap();

    try {
      const migrationResult = await convex.mutation(api.users.migrateUsers);
      setResult(migrationResult);
      haptic.success();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container bg-bg min-h-screen p-6 pt-20">
      <div className="max-w-md mx-auto">
        <h1 className="font-heading font-bold text-3xl text-text mb-2">migration.</h1>
        <p className="text-muted text-sm font-mono mb-8">
          move users from users table to creatorProfiles/businessProfiles
        </p>

        <motion.button
          className="w-full py-3 bg-text text-bg rounded-full font-heading font-bold mb-4 disabled:opacity-50"
          onClick={runMigration}
          disabled={loading}
          {...pressScale}
        >
          {loading ? 'running...' : 'run migration'}
        </motion.button>

        {error && (
          <div className="p-4 bg-red-500/10 rounded-card border border-red-500/30 mb-4">
            <p className="text-red-400 text-sm font-mono">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-500/10 rounded-card border border-green-500/30">
            <p className="text-green-400 font-heading font-bold mb-2">✓ Migration successful!</p>
            <div className="text-xs font-mono text-green-300 space-y-1">
              <p>🎬 Creators: {result.migrated.creators}</p>
              <p>🏢 Businesses: {result.migrated.businesses}</p>
              <p>📊 Total: {result.migrated.total}</p>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-surface rounded-card">
          <p className="text-xs font-mono text-muted mb-2">What this does:</p>
          <ul className="text-xs text-dim space-y-1 font-mono">
            <li>✅ Moves creators to creatorProfiles</li>
            <li>✅ Moves businesses to businessProfiles</li>
            <li>✅ Skips users without role</li>
            <li>✅ Safe to run multiple times</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
