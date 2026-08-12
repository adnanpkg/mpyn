'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, MessageSquare, Tag, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import TabBar from '@/components/tab-bar';
import { getCurrentUser } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { haptic, pressScale } from '@/lib/haptics';

interface Notification {
  _id: string;
  type: string;
  content: string;
  read?: boolean;
  createdAt: number;
}

const iconForType = (type: string) => {
  if (type === 'gig_completed') return <CheckCircle2 size={16} />;
  if (type === 'new_message') return <MessageSquare size={16} />;
  if (type === 'gig_confirmed') return <Tag size={16} />;
  if (type === 'review' || type === 'review_received') return <Star size={16} className="text-yellow-500" />;
  if (type === 'completion_pending') return <CheckCircle2 size={16} className="text-blue-600" />;
  if (type.includes('payment')) return <CheckCircle2 size={16} className="text-green-600" />;
  if (type.includes('subscription')) return <Star size={16} className="text-purple-600" />;
  return <Bell size={16} />;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser();
      if (!u) return;
      setUserId(u._id as string);
      const notifs = await convex.query(api.notifications.getForUser, { userId: u._id });
      setNotifications(notifs as Notification[]);
      setLoading(false);
    };
    load();
  }, []);

  const markAllRead = async () => {
    if (!userId) return;
    haptic.tap();
    await convex.mutation(api.notifications.markAllRead, { userId: userId as any });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="app-container bg-bg pb-24 min-h-screen">
      <header className="px-6 pt-14 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl text-text">notifications.</h1>
          <p className="text-muted text-xs font-mono">deal updates & alerts</p>
        </div>
        {unreadCount > 0 && (
          <motion.button
            className="text-xs font-mono text-muted hover:text-text"
            onClick={markAllRead}
            {...pressScale}
          >
            mark all read
          </motion.button>
        )}
      </header>

      <main className="px-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton w-full h-16 rounded-card" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell size={32} className="text-muted mb-3" />
            <p className="font-heading font-bold text-base text-text mb-1">all caught up!</p>
            <p className="text-muted text-xs font-body max-w-[220px]">
              gig updates, messages, and deal confirmations show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif, i) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`p-4 rounded-card border flex items-start gap-3 transition-colors ${
                  notif.read
                    ? 'bg-surface border-border'
                    : 'bg-elevated border-border'
                }`}
              >
                <div className={`p-2 rounded-full border flex-shrink-0 mt-0.5 ${
                  notif.read ? 'bg-surface border-border text-muted' : 'bg-elevated border-border text-text'
                }`}>
                  {iconForType(notif.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-body leading-relaxed ${notif.read ? 'text-muted' : 'text-text'}`}>
                    {notif.content}
                  </p>
                  <p className="text-[10px] font-mono text-dim mt-1">
                    {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-text flex-shrink-0 mt-1" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <TabBar />
    </div>
  );
}
