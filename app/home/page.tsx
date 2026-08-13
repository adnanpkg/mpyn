'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin, Star } from 'lucide-react';
import TabBar from '@/components/tab-bar';
import { getCurrentUser, type User } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { CONTENT_CATEGORIES } from '@/lib/categories';
import { haptic, pressScale, spring } from '@/lib/haptics';

interface FeedGig {
  _id: string;
  title: string;
  description?: string;
  charge: number;
  createdAt: number;
  creator: {
    _id: string;
    username?: string;
    city?: string;
    state?: string;
    isPro?: boolean;
    rating?: number;
    ordersCount?: number;
    profile?: {
      bio?: string;
      contentCategories?: string[];
      instagramHandle?: string;
    } | null;
  };
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedGigs, setFeedGigs] = useState<FeedGig[]>([]);
  const [fetchingFeed, setFetchingFeed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u || !u.role || !u.city) { router.replace('/'); return; }
      setUser(u);
      setLoading(false);

      try {
        setFetchingFeed(true);
        const feed = await convex.query(api.users.getFeed, {
          city: u.city,
          role: u.role,
        });
        setFeedGigs(feed as FeedGig[]);
      } catch (e) {
        console.error('feed error:', e);
      } finally {
        setFetchingFeed(false);
      }
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="app-container bg-bg min-h-screen p-6 space-y-6">
        <div className="pt-12">
          <div className="skeleton w-32 h-7 rounded-card mb-2" />
          <div className="skeleton w-48 h-4 rounded-card" />
        </div>
        <div className="skeleton w-full h-12 rounded-xl" />
        <div className="space-y-4 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton w-full h-32 rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  const filteredGigs = feedGigs.filter((gig) => {
    const title = gig.title ?? '';
    const description = gig.description ?? '';
    const creatorName = gig.creator?.username ?? '';
    const bio = gig.creator?.profile?.bio ?? '';
    
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      !selectedCategory ||
      (gig.creator?.profile?.contentCategories?.includes(selectedCategory) ?? false);
    
    return matchesSearch && matchesCategory;
  });

  // Show category filters only for businesses
  const showCategories = user?.role === 'business';

  return (
    <div className="app-container bg-bg pb-24 min-h-screen relative">
      <header className="px-6 pt-14 pb-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-text">multiply.</h1>
          <p className="text-muted text-xs font-mono mt-0.5 flex items-center gap-1">
            <MapPin size={12} />
            {user?.city}, {user?.state}
          </p>
        </div>

        <div className="mt-4 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="search-input pl-10 pr-4 py-2.5 text-sm"
            placeholder={`search gigs in ${user?.city}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {showCategories && (
          <div className="flex gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar">
            <button
              onClick={() => { haptic.tap(); setSelectedCategory(null); }}
              className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? 'bg-text text-bg font-bold btn-soft-primary'
                  : 'bg-surface text-muted border border-border btn-soft'
              }`}
            >
              all
            </button>
            {CONTENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { haptic.tap(); setSelectedCategory(cat === selectedCategory ? null : cat); }}
                className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-text text-bg font-bold btn-soft-primary'
                    : 'bg-surface text-muted border border-border btn-soft'
                }`}
              >
                {cat.toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="px-6 pt-2">
        {fetchingFeed ? (
          <div className="space-y-4 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton w-full h-32 rounded-card" />
            ))}
          </div>
        ) : filteredGigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">*</span>
            <p className="font-heading font-bold text-lg text-text mb-1">
              no gigs found
            </p>
            <p className="text-muted text-xs font-body max-w-[260px]">
              {user?.role === 'business' 
                ? `no open gigs in ${user?.city} yet. check back soon!`
                : 'tap + in gigs tab to post your first gig'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGigs.map((gig, i) => {
              const creatorName = gig.creator?.username ?? 'creator';
              const bio = gig.creator?.profile?.bio ?? '';

              return (
                <motion.div
                  key={gig._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring.default, delay: i * 0.02 }}
                  className="p-4 rounded-card bg-surface border border-border hover:border-text/40 transition-all cursor-pointer card-soft"
                  onClick={() => { haptic.tap(); router.push(`/messages?user=${gig.creator._id}`); }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center font-heading font-bold text-text btn-soft">
                        {creatorName[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-text text-base">
                          {gig.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-muted text-xs font-mono">
                            @{creatorName}
                          </p>
                          {gig.creator?.isPro && (
                            <span className="text-text text-xs" title="Pro creator">*</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-bold text-text bg-elevated px-3 py-1.5 rounded-full border border-border btn-soft">
                      ₹{gig.charge}
                    </span>
                  </div>

                  {gig.description && (
                    <p className="text-muted text-xs font-body mb-2.5 line-clamp-2">{gig.description}</p>
                  )}

                  {bio && (
                    <p className="text-dim text-[11px] font-mono mb-2.5 line-clamp-1 italic">{bio}</p>
                  )}

                  <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-dim">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-muted">
                        <Star size={11} className="text-text fill-text" />
                        {gig.creator?.rating && gig.creator.rating > 0 ? gig.creator.rating.toFixed(1) : '—'}
                      </span>
                      <span>{gig.creator?.ordersCount ?? 0} orders</span>
                    </div>
                    <span className="text-text">chat & deal →</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <TabBar />
    </div>
  );
}
