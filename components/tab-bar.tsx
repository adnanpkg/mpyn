'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Briefcase, MessageCircle, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptic, pressScale } from '@/lib/haptics';

const tabs = [
  { key: 'home', label: 'Home', icon: Home, path: '/home' },
  { key: 'gigs', label: 'Gigs', icon: Briefcase, path: '/gigs' },
  { key: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
  { key: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { key: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border"
      style={{
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="mx-auto max-w-app flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.key}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
              onClick={() => {
                haptic.tap();
                router.push(tab.path);
              }}
              {...pressScale}
            >
              <Icon
                size={20}
                className={active ? 'text-text' : 'text-dim'}
                strokeWidth={active ? 2.5 : 1.5}
              />
              {active && (
                <span className="text-[9px] font-mono text-text leading-none">
                  {tab.label}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
