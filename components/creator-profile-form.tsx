'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { haptic, spring, pressScale } from '@/lib/haptics';
import { CONTENT_CATEGORIES } from '@/lib/categories';
import { supabase } from '@/lib/supabase';

export interface CreatorProfileData {
  instagram_handle: string;
  bio: string;
  content_categories: string[];
  gig_charge: number;
  portfolio_url: string;
}

interface CreatorProfileFormProps {
  initial?: Partial<CreatorProfileData>;
  onSave: () => void;
  submitLabel?: string;
}

export default function CreatorProfileForm({
  initial,
  onSave,
  submitLabel = 'save profile',
}: CreatorProfileFormProps) {
  const [instagram, setInstagram] = useState(initial?.instagram_handle ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [categories, setCategories] = useState<string[]>(initial?.content_categories ?? []);
  const [gigCharge, setGigCharge] = useState(String(initial?.gig_charge ?? ''));
  const [portfolioUrl, setPortfolioUrl] = useState(initial?.portfolio_url ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (cat: string) => {
    haptic.tap();
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const charge = parseInt(gigCharge, 10);
  const isValid = instagram.trim() && bio.trim() && categories.length > 0 && charge >= 100;

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: saveError } = await supabase.from('creator_profiles').upsert({
        id: user.id,
        instagram_handle: instagram.replace(/^@/, '').trim(),
        bio: bio.trim(),
        content_categories: categories,
        gig_charge: charge,
        portfolio_url: portfolioUrl.trim() || null,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      });

      if (saveError) {
        // `saveError` is not always an instance of `Error`, so surface its real message.
        throw new Error(saveError.message || 'Failed to save profile');
      }
      haptic.success();
      onSave();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to save profile';
      // Helps debugging RLS/schema issues from the UI.
      // eslint-disable-next-line no-console
      console.error('[creator-profile-form] save failed:', e);
      setError(message);
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
          placeholder="Tell brands about yourself..."
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
        <label className="text-muted text-xs font-mono mb-2 block">gig charge (min ₹100)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">₹</span>
          <input
            className="search-input pl-8"
            type="number"
            min={100}
            placeholder="500"
            value={gigCharge}
            onChange={(e) => setGigCharge(e.target.value)}
          />
        </div>
        {gigCharge && charge < 100 && (
          <p className="text-red-400 text-xs mt-1">Minimum charge is ₹100</p>
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
