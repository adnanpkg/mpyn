'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, MessageSquare, Tag } from 'lucide-react';
import TabBar from '@/components/tab-bar';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface NotificationItem {
  id: string;
  type: 'gig_created' | 'status_update' | 'message';
  title: string;
  body: string;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Build real-time activity feed from user's active gigs & messages
      const { data: gigs } = await supabase
        .from('gigs')
        .select('id, title, status, created_at')
        .or(`creator_id.eq.${user.id},business_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      const items: NotificationItem[] = (gigs || []).map((g) => ({
        id: g.id,
        type: g.status === 'completed' ? 'status_update' : 'gig_created',
        title: g.status === 'completed' ? 'Gig Completed! 🎉' : 'Active Gig Tracked',
        body: `"${g.title}" status is currently ${g.status.replace('_', ' ')}.`,
        created_at: g.created_at,
      }));

      setNotifications(items);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  return (
    <div className="app-container bg-bg pb-24 min-h-screen">
      <header className="px-6 pt-14 pb-4">
        <h1 className="font-heading font-bold text-3xl text-text">notifications.</h1>
        <p className="text-muted text-xs font-mono">order activity & deal updates</p>
      </header>

      <main className="px-6">
        {loading ? (
          <div className="space-y-3">
            <div className="skeleton w-full h-16 rounded-card" />
            <div className="skeleton w-full h-16 rounded-card" />
            <div className="skeleton w-full h-16 rounded-card" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell size={32} className="text-muted mb-3" />
            <p className="font-heading font-bold text-base text-text mb-1">all caught up!</p>
            <p className="text-muted text-xs font-body max-w-[220px]">
              when gigs are created or status updates change, you&apos;ll be notified here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-card bg-surface border border-border flex items-start gap-3"
              >
                <div className="p-2 rounded-full bg-elevated border border-border text-text mt-0.5">
                  {notif.type === 'status_update' ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Tag size={16} />
                  )}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-text">{notif.title}</h4>
                  <p className="text-muted text-xs font-body mt-0.5">{notif.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <TabBar />
    </div>
  );
}

