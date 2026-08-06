'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Star, CheckCircle2, MapPin } from 'lucide-react';
import TabBar from '@/components/tab-bar';
import { supabase } from '@/lib/supabase';
import { getProfile, getCreatorProfile, needsCreatorSetup, UserProfile } from '@/lib/profile';
import { CONTENT_CATEGORIES } from '@/lib/categories';
import { haptic, pressScale, spring } from '@/lib/haptics';

interface FeedItem {
  id: string;
  username: string;
  role: 'creator' | 'business';
  city: string;
  state: string;
  is_pro?: boolean;
  rating?: number;
  orders_count?: number;
  charge?: number;
  bio?: string;
  categories?: string[];
  avatar_url?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fetchingFeed, setFetchingFeed] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const checkAndFetchFeed = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/');
        return;
      }

      const profile = await getProfile(user.id);
      if (!profile) {
        router.replace('/');
        return;
      }

      const creatorProfile = await getCreatorProfile(user.id);
      if (needsCreatorSetup(profile, creatorProfile)) {
        router.replace('/profile/setup');
        return;
      }

      setUserProfile(profile);
      setLoading(false);

      // Fetch hyperlocal feed: Gigs posted in user's city + Profiles matching city
      try {
        setFetchingFeed(true);
        const targetRole = profile.role === 'creator' ? 'business' : 'creator';
        
        // 1. Fetch matching profiles in city
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', targetRole)
          .eq('city', profile.city);

        // 2. Fetch active gigs posted in the same city
        const { data: gigsData } = await supabase
          .from('gigs')
          .select('*, profiles!gigs_creator_id_fkey(username, city, state, role, is_pro)')
          .order('created_at', { ascending: false });

        const gigItems: FeedItem[] = (gigsData || [])
          .filter((g) => g.profiles && g.profiles.city === profile.city)
          .map((g) => ({
            id: g.id,
            username: g.profiles.username || 'Business/Creator',
            role: g.profiles.role,
            city: g.profiles.city,
            state: g.profiles.state,
            is_pro: g.profiles.is_pro,
            charge: g.price || g.charge,
            bio: `${g.title} - ${g.description || ''}`,
          }));

        const combinedFeed = [...gigItems, ...((profiles as FeedItem[]) || [])];

        // Sort items by ranking algorithm: Pro users first, then orders_count desc, then rating desc
        const sorted = combinedFeed.sort((a, b) => {
          if (a.is_pro && !b.is_pro) return -1;
          if (!a.is_pro && b.is_pro) return 1;
          const ordersA = a.orders_count || 0;
          const ordersB = b.orders_count || 0;
          if (ordersA !== ordersB) return ordersB - ordersA;
          return (b.rating || 0) - (a.rating || 0);
        });

        setFeedItems(sorted);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load feed:', e);
      } finally {
        setFetchingFeed(false);
      }

    };

    checkAndFetchFeed();
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
          <div className="skeleton w-full h-32 rounded-card" />
          <div className="skeleton w-full h-32 rounded-card" />
          <div className="skeleton w-full h-32 rounded-card" />
        </div>
      </div>
    );
  }

  const filteredItems = feedItems.filter((item) => {
    const matchesSearch =
      item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.bio && item.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      !selectedCategory || (item.categories && item.categories.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-container bg-bg pb-24 min-h-screen relative">
      <header className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-3xl text-text">multiply.</h1>
            <p className="text-muted text-xs font-mono mt-0.5 flex items-center gap-1">
              <MapPin size={12} className="text-muted" />
              {userProfile?.city}, {userProfile?.state}
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-surface border border-border text-muted">
            {userProfile?.role} mode
          </span>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="search-input pl-10 pr-4 py-2.5 text-sm"
            placeholder={`search ${userProfile?.role === 'creator' ? 'businesses' : 'creators'} in ${userProfile?.city}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
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
      </header>

      <main className="px-6 pt-2">
        {fetchingFeed ? (
          <div className="space-y-4 pt-2">
            <div className="skeleton w-full h-32 rounded-card" />
            <div className="skeleton w-full h-32 rounded-card" />
            <div className="skeleton w-full h-32 rounded-card" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">✳</span>
            <p className="font-heading font-bold text-lg text-text mb-1">no {userProfile?.role === 'creator' ? 'businesses' : 'creators'} found</p>
            <p className="text-muted text-xs font-body max-w-[260px]">
              no active {userProfile?.role === 'creator' ? 'businesses' : 'creators'} listed in {userProfile?.city} yet. tap + to launch a gig!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring.default, delay: i * 0.02 }}
                className="p-4 rounded-card bg-surface border border-border hover:border-text/40 transition-all cursor-pointer"
                onClick={() => { haptic.tap(); router.push(`/messages?user=${item.id}`); }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center font-heading font-bold text-text">
                      {item.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-heading font-bold text-text text-base">@{item.username}</h3>
                        {item.is_pro && (
                          <span className="text-text text-xs" title="Verified Pro Subscriber">✳</span>
                        )}
                      </div>
                      <p className="text-muted text-xs font-mono">{item.city}, {item.state}</p>
                    </div>
                  </div>

                  {item.charge && (
                    <span className="text-xs font-mono font-bold text-text bg-elevated px-2.5 py-1 rounded-full border border-border">
                      ₹{item.charge}
                    </span>
                  )}
                </div>

                {item.bio && (
                  <p className="text-muted text-xs font-body mt-2.5 line-clamp-2">{item.bio}</p>
                )}

                <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-dim">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-muted">
                      <Star size={11} className="text-text fill-text" /> {item.rating ? item.rating.toFixed(1) : '5.0'}
                    </span>
                    <span>{item.orders_count || 0} orders completed</span>
                  </div>
                  <span className="text-text hover:underline">chat & deal →</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button for Gigs */}
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

