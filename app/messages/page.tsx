'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, ArrowLeft, User, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import TabBar from '@/components/tab-bar';
import { getCurrentUser, type User as AuthUser } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { haptic, pressScale } from '@/lib/haptics';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: number;
  read?: boolean;
}

interface Conversation {
  partner: {
    _id: string;
    username?: string;
    role?: string;
  } | null;
  lastMessage?: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerInfo, setPartnerInfo] = useState<{ username?: string; role?: string } | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u) { router.replace('/'); return; }
      setCurrentUser(u);

      if (targetUserId) {
        // Load thread
        const thread = await convex.query(api.messages.getThread, {
          userId: u._id,
          partnerId: targetUserId as any,
        });
        setMessages(thread as Message[]);

        // Get partner info
        const partner = await convex.query(api.users.getById, {
          userId: targetUserId as any,
        });
        setPartnerInfo(partner as any);

        // Mark messages read
        await convex.mutation(api.messages.markRead, {
          userId: u._id,
          partnerId: targetUserId as any,
        });

        setTimeout(scrollToBottom, 100);
      } else {
        // Load conversation list
        const convos = await convex.query(api.messages.getConversations, {
          userId: u._id,
        });
        setConversations(convos as Conversation[]);
      }
      setLoading(false);
    };
    init();
  }, [router, targetUserId]);

  // Poll for new messages every 3s when in a thread
  useEffect(() => {
    if (!targetUserId || !currentUser) return;
    const interval = setInterval(async () => {
      const thread = await convex.query(api.messages.getThread, {
        userId: currentUser._id,
        partnerId: targetUserId as any,
      });
      setMessages(thread as Message[]);
      scrollToBottom();
    }, 3000);
    return () => clearInterval(interval);
  }, [targetUserId, currentUser]);

  const sendMessage = async () => {
    if (!input.trim() || !currentUser || !targetUserId) return;
    const text = input.trim();
    setInput('');
    haptic.tap();

    // Optimistic UI
    const temp: Message = {
      _id: Date.now().toString(),
      senderId: currentUser._id as string,
      receiverId: targetUserId,
      text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, temp]);
    setTimeout(scrollToBottom, 50);

    try {
      await convex.mutation(api.messages.send, {
        senderId: currentUser._id,
        receiverId: targetUserId as any,
        text,
      });
    } catch (e) {
      console.error('send failed:', e);
    }
  };

  // ── Thread view ─────────────────────────────────────────
  if (targetUserId) {
    return (
      <div className="app-container bg-bg min-h-screen flex flex-col">
        <header className="px-6 pt-14 pb-4 border-b border-border flex items-center gap-3 bg-surface/80 backdrop-blur sticky top-0 z-20">
          <button
            onClick={() => { haptic.tap(); router.push('/messages'); }}
            className="text-muted hover:text-text"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center font-bold text-xs">
            {partnerInfo?.username?.[0]?.toUpperCase() ?? <User size={14} />}
          </div>
          <div>
            <h2 className="font-heading font-bold text-sm text-text">
              {partnerInfo?.username ? `@${partnerInfo.username}` : 'direct message'}
            </h2>
            <p className="text-[10px] font-mono text-muted capitalize">
              {partnerInfo?.role ?? 'user'}
            </p>
          </div>
        </header>

        <main className="flex-1 px-6 py-4 space-y-3 overflow-y-auto pb-24">
          {loading ? (
            <div className="space-y-3 pt-4">
              <div className="skeleton w-48 h-8 rounded-2xl" />
              <div className="skeleton w-36 h-8 rounded-2xl ml-auto" />
              <div className="skeleton w-56 h-8 rounded-2xl" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-xs font-mono text-dim py-12">
              say hi to start the gig conversation! ✳
            </p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === (currentUser?._id as string);
              return (
                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-body ${
                      isMine
                        ? 'bg-text text-bg rounded-br-none font-medium'
                        : 'bg-surface text-text border border-border rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </main>

        <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-2 bg-bg/90 backdrop-blur max-w-app mx-auto">
          <div className="flex items-center gap-2 bg-surface p-2 rounded-full border border-border">
            <input
              className="flex-1 bg-transparent px-4 text-xs text-text outline-none"
              placeholder="type message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <motion.button
              className="w-8 h-8 rounded-full bg-text text-bg flex items-center justify-center disabled:opacity-40"
              disabled={!input.trim()}
              onClick={sendMessage}
              {...pressScale}
            >
              <Send size={14} />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ── Conversation list view ───────────────────────────────
  return (
    <div className="app-container bg-bg pb-24 min-h-screen">
      <header className="px-6 pt-14 pb-4">
        <h1 className="font-heading font-bold text-3xl text-text">messages.</h1>
        <p className="text-muted text-xs font-mono">conversations & deals</p>
      </header>

      <main className="px-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton w-full h-16 rounded-card" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MessageCircle size={32} className="text-muted mb-3" />
            <p className="font-heading font-bold text-base text-text mb-1">no messages yet</p>
            <p className="text-muted text-xs font-body max-w-[220px]">
              tap "chat & deal" on any profile in your home feed to start a conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((convo) => {
              if (!convo.partner) return null;
              return (
                <motion.button
                  key={convo.partner._id}
                  className="w-full p-4 rounded-card bg-surface border border-border flex items-center gap-3 text-left"
                  onClick={() => {
                    haptic.tap();
                    router.push(`/messages?user=${convo.partner!._id}`);
                  }}
                  {...pressScale}
                >
                  <div className="w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center font-heading font-bold text-text flex-shrink-0">
                    {convo.partner.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-sm text-text">
                        @{convo.partner.username ?? 'user'}
                      </span>
                      {convo.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-text text-bg text-[10px] font-mono font-bold flex items-center justify-center">
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                    {convo.lastMessage && (
                      <p className="text-muted text-xs font-body truncate mt-0.5">
                        {convo.lastMessage.text}
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </main>
      <TabBar />
    </div>
  );
}
