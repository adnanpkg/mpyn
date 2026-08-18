'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { haptic, pressScale } from '@/lib/haptics';
import { getCurrentUser } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import PFPSelector from '@/components/pfp-selector';

const BUSINESS_CATEGORIES = [
  'Restaurant',
  'Cafe',
  'Fashion',
  'Beauty & Wellness',
  'Fitness',
  'Retail',
  'Entertainment',
  'Education',
  'Tech',
  'Real Estate',
  'Travel',
  'Healthcare',
  'Other',
];

export interface BusinessProfileData {
  name?: string;
  category?: string;
  description?: string;
  address?: string;
  pfpSvg?: string;
}

interface Props {
  initial?: Partial<BusinessProfileData>;
  onSave: () => void;
  submitLabel?: string;
}

export default function BusinessProfileForm({ initial, onSave, submitLabel = 'save profile' }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [pfpSvg, setPfpSvg] = useState(initial?.pfpSvg ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = name.trim() && category && description.trim();

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    haptic.tap();
    try {
      const u = await getCurrentUser();
      if (!u) throw new Error('not authenticated');

      await convex.mutation(api.users.saveBusinessProfile, {
        userId: u._id,
        name: name.trim(),
        category,
        description: description.trim(),
        address: address.trim() || undefined,
        pfpSvg: pfpSvg || undefined,
      });

      haptic.success();
      onSave();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'failed to save profile');
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PFPSelector
        selected={pfpSvg}
        onChange={setPfpSvg}
        showInitials={true}
        initials={name.slice(0, 2).toUpperCase() || 'BS'}
      />

      <div>
        <label className="text-muted text-xs font-mono mb-2 block">business name</label>
        <input
          className="search-input"
          placeholder="e.g. Brew & Co"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div>
        <label className="text-muted text-xs font-mono mb-3 block">category</label>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              className={`px-4 py-2 rounded-pill text-sm font-body transition-colors ${
                category === cat
                  ? 'bg-text text-bg'
                  : 'bg-surface text-text'
              }`}
              onClick={() => { haptic.tap(); setCategory(cat); }}
              whileTap={{ scale: 0.96 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-muted text-xs font-mono mb-2 block">about your business</label>
        <textarea
          className="search-input min-h-[100px] resize-none"
          placeholder="describe what you do and what kind of content you're looking for..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={400}
        />
        <p className="text-dim text-xs mt-1 text-right">{description.length}/400</p>
      </div>

      <div>
        <label className="text-muted text-xs font-mono mb-2 block">address (optional)</label>
        <input
          className="search-input"
          placeholder="e.g. 12 MG Road, Bengaluru"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {error && <p className="text-red-400 text-sm font-body">{error}</p>}

      <motion.button
        className="pill-btn-primary w-full disabled:opacity-40"
        disabled={!isValid || loading}
        onClick={handleSave}
        {...pressScale}
      >
        {loading ? 'saving...' : submitLabel}
      </motion.button>
    </div>
  );
}
