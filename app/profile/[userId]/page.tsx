'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Briefcase, ArrowLeft, MessageCircle } from 'lucide-react';
import { getCurrentUser, type User } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { haptic, pressScale } from '@/lib/haptics';
import RatingDialog from '@/components/rating-dialog';
import { Id } from '@/convex/_generated/dataModel';

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

interface PublicUser extends User {
  proExpiresAt?: number;
}

export default function PublicProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  useEffect(() => {
    const load = async () => {
      const cu = await getCurrentUser();
      if (!cu) { router.replace('/'); return; }
      setCurrentUser(cu);

      try {
        // Get the public user profile
        const pu = await convex.query(api.users.getById, { userId: params.userId as Id<'users'> });
        if (!pu) {
          router.replace('/home');
          return;
        }
        setProfileUser(pu as PublicUser);

        // Get their profile data
        if (pu.role === 'creator') {
          const cp = await convex.query(api.users.getCreatorProfile, { userId: params.userId as Id<'users'> });
          setCreatorProfile(cp as CreatorProfile | null);
        } else if (pu.role === 'business') {
          const bp = await convex.query(api.users.getBusinessProfile, { userId: params.userId as Id<'users'> });
          setBusinessProfile(bp as BusinessProfile | null);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        router.replace('/home');
        return;
      }

      setLoading(false);
    };
    load();
  }, [router, params.userId]);

  const handleMessage = () => {
    haptic.tap();
    router.push(`/messages?user=${params.userId}`);
  };

  const handleRate = () => {
    haptic.tap();
    setShowRatingDialog(true);
  };

  if (loading) {
    return (
      <div className="app-container bg-bg min-h-screen flex items-center justify-center">
        <div className="skeleton w-24 h-4 rounded" />
      </div>
    );
  }

  if (!profileUser) {
    return null;
  }

  const isProActive = profileUser.isPro && profileUser.proExpiresAt && profileUser.proExpiresAt > Date.now();

  return (
    <div className="app-container bg-bg pb-24 min-h-screen">
      <header className="px-6 pt-14 pb-6 flex items-center gap-4">
        <motion.button
          className="p-2 text-muted hover:text-text transition-colors -ml-2"
          onClick={() => { haptic.tap(); router.back(); }}
          {...pressScale}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="font-heading font-bold text-2xl text-text">profile.</h1>
      </header>

      <main className="px-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-elevated flex items-center justify-center text-2xl font-heading font-bold mb-4">
            {profileUser?.username?.slice(0, 2).toUpperCase() || '?'}
          </div>
          <h2 className="font-heading font-bold text-xl text-text">
            @{profileUser?.username}
          </h2>
          <p className="text-muted text-sm font-body mt-1 capitalize">
            {profileUser?.role} · {profileUser?.city}, {profileUser?.state}
          </p>
          {isProActive && (
            <span className="mt-2 px-3 py-1 rounded-full bg-text text-bg text-xs font-mono font-bold">
              * pro
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 p-3 rounded-card bg-surface text-center">
            <p className="font-heading font-bold text-xl text-text">{profileUser?.ordersCount ?? 0}</p>
            <p className="text-dim text-[10px] font-mono flex items-center justify-center gap-1 mt-0.5">
              <Briefcase size={10} /> orders
            </p>
          </div>
          <div className="flex-1 p-3 rounded-card bg-surface text-center">
            <p className="font-heading font-bold text-xl text-text">
              {profileUser?.rating && profileUser.rating > 0 ? profileUser.rating.toFixed(1) : '—'}
            </p>
            <p className="text-dim text-[10px] font-mono flex items-center justify-center gap-1 mt-0.5">
              <Star size={10} /> {profileUser?.rating && profileUser.rating > 0 ? 'rating' : 'no rating yet'}
            </p>
          </div>
        </div>

        {/* Creator profile details */}
        {profileUser?.role === 'creator' && creatorProfile && (
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
                      className="px-3 py-1 rounded-pill bg-surface text-text text-xs font-body"
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
        {profileUser?.role === 'business' && businessProfile && (
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

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <motion.button
            className="flex-1 pill-btn-primary flex items-center justify-center gap-2"
            onClick={handleMessage}
            {...pressScale}
          >
            <MessageCircle size={16} />
            message
          </motion.button>
          <motion.button
            className="flex-1 pill-btn-outline flex items-center justify-center gap-2"
            onClick={handleRate}
            {...pressScale}
          >
            <Star size={16} />
            rate
          </motion.button>
        </div>
      </main>

      {/* Rating dialog */}
      {showRatingDialog && currentUser && (
        <RatingDialog
          isOpen={showRatingDialog}
          onClose={() => setShowRatingDialog(false)}
          gigId={null}
          revieweeId={params.userId as Id<'users'>}
          reviewerId={currentUser._id}
          revieweeName={profileUser.username || 'user'}
        />
      )}
    </div>
  );
}
