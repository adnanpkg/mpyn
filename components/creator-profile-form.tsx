'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { haptic, spring, pressScale } from '@/lib/haptics';
import { CONTENT_CATEGORIES } from '@/lib/categories';
import { getCurrentUser } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export interface CreatorProfileData {
  instagramHandle?: string;
  bio?: string;
  contentCategories?: string[];
  gigCharge?: number;
  portfolioUrl?: string;
}

interface Props {
  initial?: Partial<CreatorProfileData>;
  onSave: () => void;
  submitLabel?: string;
}

export default function CreatorProfileForm({ initial, onSave, submitLabel = 'save profile' }: Props) {
  const [instagram, setInstagram] = useState(initial?.instagramHandle ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [categories, setCategories] = useState<string[]>(initial?.contentCategories ?? []);
  const [gigCharge, setGigCharge] = useState(String(initial?.gigCharge ?? ''));
  const [portfolioUrl, setPortfolioUrl] = useState(initial?.portfolioUrl ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const charge = parseInt(gigCharge, 10);
  const isValid = instagram.trim() && bio.trim() && categories.length > 0 && charge >= 500;

  const toggleCategory = (cat: string) => {
    haptic.tap();
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      const u = await getCurrentUser();
      if (!u) throw new Error('not authenticated');

      await convex.mutation(api.users.saveCreatorProfile, {
        userId: u._id,
        instagramHandle: instagram.replace(/^@/, '').trim(),
        bio: bio.trim(),
        contentCategories: categories,
        gigCharge: charge,
        portfolioUrl: portfolioUrl.trim() || undefined,
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
      <div>
        <label className="text-muted text-xs font-mono mb-2 block">instagram handle</label>
        <input
          className="search-input"
          placeholder="@yourhandle"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
      </div>

      <div>
        <label className="text-muted text-xs font-mono mb-2 block">bio</label>
        <textarea
          className="search-input min-h-[100px] resize-none"
          placeholder="tell brands about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={300}
        />
        <p className="text-dim text-xs mt-1 text-right">{bio.length}/300</p>
      </div>

      <div>
        <label className="text-muted text-xs font-mono mb-3 block">content categories</label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_CATEGORIES.map((cat) => {
            const selected = categories.includes(cat);
            return (
              <motion.button
                key={cat}
                className={`px-4 py-2 rounded-pill text-sm font-body border transition-colors ${
                  selected
                    ? 'bg-text text-bg border-text'
                    : 'bg-surface text-text border-border'
                }`}
                onClick={() => toggleCategory(cat)}
                whileTap={{ scale: 0.96 }}
                transition={spring.default}
              >
                {cat}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-muted text-xs font-mono mb-2 block">gig charge (min ₹500)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">₹</span>
          <input
            className="search-input pl-8"
            type="number"
            min={500}
            placeholder="500"
            value={gigCharge}
            onChange={(e) => setGigCharge(e.target.value)}
          />
        </div>
        {gigCharge && charge < 500 && (
          <p className="text-red-400 text-xs mt-1">minimum charge is ₹500</p>
        )}
      </div>

      <div>
        <label className="text-muted text-xs font-mono mb-2 block">portfolio url (optional)</label>
        <input
          className="search-input"
          type="url"
          placeholder="https://..."
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
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
