'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Pencil, Star, Briefcase } from 'lucide-react';
import TabBar from '@/components/tab-bar';
import ProUpgradeCard from '@/components/pro-upgrade-card';
import { getCurrentUser, signOut, type User } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { haptic, pressScale } from '@/lib/haptics';

interface CreatorProfile {
  instagramHandle?: string;
  bio?: string;
  contentCategories?: string[];
  gigCharge?: number;
  portfolioUrl?: string;
}

interface BusinessProfile {
  name?: string;
  category?: string;
  description?: string;
  address?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser();
      if (!u) { router.replace('/'); return; }
      setUser(u);

      if (u.role === 'creator') {
        const cp = await convex.query(api.users.getCreatorProfile, { userId: u._id });
        setCreatorProfile(cp as CreatorProfile | null);
      } else if (u.role === 'business') {
        const bp = await convex.query(api.users.getBusinessProfile, { userId: u._id });
        setBusinessProfile(bp as BusinessProfile | null);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const handleSignOut = async () => {
    haptic.tap();
    await signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="app-container bg-bg min-h-screen flex items-center justify-center">
        <div className="skeleton w-24 h-4 rounded" />
      </div>
    );
  }

  return (
    <div className="app-container bg-bg pb-24 min-h-screen">
      <header className="px-6 pt-14 pb-6 flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-text">profile.</h1>
        <motion.button className="p-2 text-dim" onClick={handleSignOut} {...pressScale}>
          <LogOut size={18} />
        </motion.button>
      </header>

      <main className="px-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-elevated border border-border flex items-center justify-center text-2xl font-heading font-bold mb-4">
            {user?.username?.slice(0, 2).toUpperCase() || '?'}
          </div>
          <h2 className="font-heading font-bold text-xl text-text">
            @{user?.username}
          </h2>
          <p className="text-muted text-sm font-body mt-1 capitalize">
            {user?.role} · {user?.city}, {user?.state}
          </p>
          {user?.isPro && (user as any)?.proExpiresAt && (user as any)?.proExpiresAt > Date.now() ? (
            <span className="mt-2 px-3 py-1 rounded-full bg-text text-bg text-xs font-mono font-bold">
              * pro
            </span>
          ) : user?.isPro ? (
            <span className="mt-2 px-3 py-1 rounded-full bg-gray-400 text-white text-xs font-mono font-bold">
              pro expired
            </span>
          ) : null}
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 p-3 rounded-card bg-surface border border-border text-center">
            <p className="font-heading font-bold text-xl text-text">{user?.ordersCount ?? 0}</p>
            <p className="text-dim text-[10px] font-mono flex items-center justify-center gap-1 mt-0.5">
              <Briefcase size={10} /> orders
            </p>
          </div>
          <div className="flex-1 p-3 rounded-card bg-surface border border-border text-center">
            <p className="font-heading font-bold text-xl text-text">
              {user?.rating && user.rating > 0 ? user.rating.toFixed(1) : '—'}
            </p>
            <p className="text-dim text-[10px] font-mono flex items-center justify-center gap-1 mt-0.5">
              <Star size={10} /> {user?.rating && user.rating > 0 ? 'rating' : 'no rating yet'}
            </p>
          </div>
        </div>

        {/* Creator profile details */}
        {user?.role === 'creator' && creatorProfile && (
          <div className="space-y-4 mb-8">
            {creatorProfile.instagramHandle && (
              <div>
                <p className="text-dim text-xs font-mono mb-1">instagram</p>
                <p className="text-text text-sm font-body">@{creatorProfile.instagramHandle}</p>
              </div>
            )}
            {creatorProfile.bio && (
              <div>
                <p className="text-dim text-xs font-mono mb-1">bio</p>
                <p className="text-text text-sm font-body">{creatorProfile.bio}</p>
              </div>
            )}
            {creatorProfile.contentCategories && creatorProfile.contentCategories.length > 0 && (
              <div>
                <p className="text-dim text-xs font-mono mb-2">categories</p>
                <div className="flex flex-wrap gap-2">
                  {creatorProfile.contentCategories.map((cat) => (
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
            {creatorProfile.gigCharge && (
              <div>
                <p className="text-dim text-xs font-mono mb-1">gig charge</p>
                <p className="text-text text-sm font-body">₹{creatorProfile.gigCharge}</p>
              </div>
            )}
            {creatorProfile.portfolioUrl && (
              <div>
                <p className="text-dim text-xs font-mono mb-1">portfolio</p>
                <a
                  href={creatorProfile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text text-sm font-body underline"
                >
                  {creatorProfile.portfolioUrl}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Business profile details */}
        {user?.role === 'business' && businessProfile && (
          <div className="space-y-4 mb-8">
            {businessProfile.name && (
              <div>
                <p className="text-dim text-xs font-mono mb-1">business name</p>
                <p className="text-text text-sm font-body">{businessProfile.name}</p>
              </div>
            )}
            {businessProfile.category && (
              <div>
                <p className="text-dim text-xs font-mono mb-1">category</p>
                <p className="text-text text-sm font-body">{businessProfile.category}</p>
              </div>
            )}
            {businessProfile.description && (
              <div>
                <p className="text-dim text-xs font-mono mb-1">about</p>
                <p className="text-text text-sm font-body">{businessProfile.description}</p>
              </div>
            )}
            {businessProfile.address && (
              <div>
                <p className="text-dim text-xs font-mono mb-1">address</p>
                <p className="text-text text-sm font-body">{businessProfile.address}</p>
              </div>
            )}
          </div>
        )}

        {/* Pro subscription upgrade card */}
        <ProUpgradeCard
          userId={user?._id as string}
          userEmail={user?.email as string}
          isPro={user?.isPro}
          proExpiresAt={(user as any)?.proExpiresAt}
          onUpgradeSuccess={() => {
            // Refresh user data after successful upgrade
            window.location.reload();
          }}
        />

        {/* Edit profile button */}
        <motion.button
          className="pill-btn-outline w-full flex items-center justify-center gap-2 mb-4"
          onClick={() => { haptic.tap(); router.push('/profile/edit'); }}
          {...pressScale}
        >
          <Pencil size={16} />
          edit profile
        </motion.button>

        {/* Setup profile prompt if not complete */}
        {user?.role === 'creator' && !creatorProfile && (
          <motion.button
            className="pill-btn-primary w-full mb-4"
            onClick={() => { haptic.tap(); router.push('/profile/setup'); }}
            {...pressScale}
          >
            complete creator profile
          </motion.button>
        )}
        {user?.role === 'business' && !businessProfile && (
          <motion.button
            className="pill-btn-primary w-full mb-4"
            onClick={() => { haptic.tap(); router.push('/profile/setup'); }}
            {...pressScale}
          >
            complete business profile
          </motion.button>
        )}

        {/* Sign out */}
        <motion.button
          className="w-full py-3 text-red-500 text-sm font-mono border border-red-500/20 rounded-pill hover:bg-red-500/5 transition-colors"
          onClick={handleSignOut}
          {...pressScale}
        >
          sign out
        </motion.button>
      </main>

      <TabBar />
    </div>
  );
}
