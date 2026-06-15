'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Pencil } from 'lucide-react';
import TabBar from '@/components/tab-bar';
import { supabase } from '@/lib/supabase';
import { getProfile, getCreatorProfile, type Profile, type CreatorProfile } from '@/lib/profile';
import { haptic, pressScale } from '@/lib/haptics';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/');
        return;
      }
      const p = await getProfile(user.id);
      if (!p) {
        router.replace('/');
        return;
      }
      setProfile(p);
      if (p.role === 'creator') {
        setCreatorProfile(await getCreatorProfile(user.id));
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const handleSignOut = async () => {
    haptic.tap();
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="app-container bg-bg min-h-screen flex items-center justify-center">
        <div className="skeleton w-24 h-4" />
      </div>
    );
  }

  return (
    <div className="app-container bg-bg pb-20 min-h-screen">
      <header className="px-6 pt-14 pb-6 flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-text">Profile</h1>
        <motion.button
          className="p-2 text-dim"
          onClick={handleSignOut}
          {...pressScale}
        >
          <LogOut size={18} />
        </motion.button>
      </header>

      <main className="px-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-elevated border border-border flex items-center justify-center text-3xl mb-4">
            ✳
          </div>
          <h2 className="font-heading font-bold text-xl text-text">
            @{profile?.username}
          </h2>
          <p className="text-muted text-sm font-body mt-1 capitalize">
            {profile?.role} · {profile?.city}, {profile?.state}
          </p>
        </div>

        {profile?.role === 'creator' && creatorProfile && (
          <div className="space-y-4 mb-8">
            {creatorProfile.instagram_handle && (
              <div>
                <p className="text-dim text-xs font-mono mb-1">instagram</p>
                <p className="text-text text-sm font-body">@{creatorProfile.instagram_handle}</p>
              </div>
            )}
            {creatorProfile.bio && (
              <div>
                <p className="text-dim text-xs font-mono mb-1">bio</p>
                <p className="text-text text-sm font-body">{creatorProfile.bio}</p>
              </div>
            )}
            {creatorProfile.content_categories?.length > 0 && (
              <div>
                <p className="text-dim text-xs font-mono mb-2">categories</p>
                <div className="flex flex-wrap gap-2">
                  {creatorProfile.content_categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 rounded-pill bg-surface border border-border text-text text-xs font-body"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {creatorProfile.gig_charge && (
              <div>
                <p className="text-dim text-xs font-mono mb-1">gig charge</p>
                <p className="text-text text-sm font-body">₹{creatorProfile.gig_charge}</p>
              </div>
            )}
            {creatorProfile.portfolio_url && (
              <div>
                <p className="text-dim text-xs font-mono mb-1">portfolio</p>
                <a
                  href={creatorProfile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text text-sm font-body underline"
                >
                  {creatorProfile.portfolio_url}
                </a>
              </div>
            )}
          </div>
        )}

        {profile?.role === 'creator' && (
          <motion.button
            className="pill-btn-outline w-full flex items-center justify-center gap-2"
            onClick={() => { haptic.tap(); router.push('/profile/edit'); }}
            {...pressScale}
          >
            <Pencil size={16} />
            edit profile
          </motion.button>
        )}
      </main>

      <TabBar />
    </div>
  );
}
