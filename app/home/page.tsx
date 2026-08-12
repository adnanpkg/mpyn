'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Search, MapPin, Star } from 'lucide-react';
import TabBar from '@/components/tab-bar';
import { getCurrentUser, type User } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { CONTENT_CATEGORIES } from '@/lib/categories';
import { haptic, pressScale, spring } from '@/lib/haptics';

interface FeedUser {
  _id: string;
  username?: string;
  role?: string;
  city?: string;
  state?: string;
  isPro?: boolean;
  rating?: number;
  ordersCount?: number;
  profile?: {
    gigCharge?: number;
    bio?: string;
    contentCategories?: string[];
    description?: string;
    name?: string;
    category?: string;
  } | null;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedItems, setFeedItems] = useState<FeedUser[]>([]);
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
        setFeedItems(feed as FeedUser[]);
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
          <div className="skeleton w-32 h-7 rounded-md mb-2" />
          <div className="skeleton w-48 h-4 rounded-md" />
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

  const filteredItems = feedItems.filter((item) => {
    const name = item.username ?? '';
    const bio = item.profile?.bio ?? item.profile?.description ?? '';
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      (item.profile?.contentCategories?.includes(selectedCategory) ?? false);
    return matchesSearch && matchesCategory;
  });

  const targetLabel = user?.role === 'creator' ? 'businesses' : 'creators';

  return (
    <div className="app-container bg-bg pb-24 min-h-screen relative">
      <header className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-3xl text-text">multiply.</h1>
            <p className="text-muted text-xs font-mono mt-0.5 flex items-center gap-1">
              <MapPin size={12} />
              {user?.city}, {user?.state}
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-surface border border-border text-muted">
            {user?.role} mode
          </span>
        </div>

        <div className="mt-4 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="search-input pl-10 pr-4 py-2.5 text-sm"
            placeholder={`search ${targetLabel} in ${user?.city}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category pills — only relevant for creator-mode (browsing businesses) */}
        {user?.role === 'business' && (
          <div className="flex gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar">
            <button
              onClick={() => { haptic.tap(); setSelectedCategory(null); }}
              className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? 'bg-text text-bg font-bold'
                  : 'bg-surface text-muted border border-border'
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
                    ? 'bg-text text-bg font-bold'
                    : 'bg-surface text-muted border border-border'
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
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">✳</span>
            <p className="font-heading font-bold text-lg text-text mb-1">
              no {targetLabel} found
            </p>
            <p className="text-muted text-xs font-body max-w-[260px]">
              no {targetLabel} listed in {user?.city} yet. be the first or tap + to post a gig!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, i) => {
              const displayName =
                item.role === 'business'
                  ? (item.profile?.name ?? item.username ?? 'business')
                  : (item.username ?? 'creator');
              const bio =
                item.profile?.bio ??
                item.profile?.description ??
                (item.profile?.category ? `${item.profile.category}` : '');
              const charge = item.profile?.gigCharge;

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring.default, delay: i * 0.02 }}
                  className="p-4 rounded-card bg-surface border border-border hover:border-text/40 transition-all cursor-pointer"
                  onClick={() => { haptic.tap(); router.push(`/messages?user=${item._id}`); }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center font-heading font-bold text-text">
                        {displayName[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading font-bold text-text text-base">
                            {item.role === 'business' ? displayName : `@${displayName}`}
                          </h3>
                          {item.isPro && (
                            <span className="text-text text-xs" title="Pro subscriber">✳</span>
                          )}
                        </div>
                        <p className="text-muted text-xs font-mono">
                          {item.city}, {item.state}
                        </p>
                      </div>
                    </div>
                    {charge && (
                      <span className="text-xs font-mono font-bold text-text bg-elevated px-2.5 py-1 rounded-full border border-border">
                        ₹{charge}
                      </span>
                    )}
                  </div>

                  {bio && (
                    <p className="text-muted text-xs font-body mt-2.5 line-clamp-2">{bio}</p>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-dim">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-muted">
                        <Star size={11} className="text-text fill-text" />
                        {item.rating ? item.rating.toFixed(1) : '5.0'}
                      </span>
                      <span>{item.ordersCount ?? 0} orders</span>
                    </div>
                    <span className="text-text">chat & deal →</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <motion.button
        className="fixed bottom-24 right-6 z-30 w-14 h-14 rounded-full bg-text text-bg flex items-center justify-center shadow-2xl border border-bg"
        onClick={() => { haptic.tap(); router.push('/create-gig'); }}
        {...pressScale}
      >
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>

      <TabBar />
    </div>
  );
}
