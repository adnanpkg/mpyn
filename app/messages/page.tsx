'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import TabBar from '@/components/tab-bar';
import { getCurrentUser, type User as AuthUser } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { haptic, pressScale, spring } from '@/lib/haptics';
import { type Id } from '@/convex/_generated/dataModel';

interface Message {
  _id: Id<'messages'>;
  senderId: Id<'users'>;
  receiverId: Id<'users'>;
  text: string;
  createdAt: number;
}

interface PartnerInfo {
  _id: Id<'users'>;
  username?: string;
  role?: string;
}

interface Conversation {
  partnerId: Id<'users'>;
  partnerUsername: string;
  lastMessage?: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user and conversations
  useEffect(() => {
    const init = async () => {
      try {
        const u = await getCurrentUser();
        if (!u) {
          router.replace('/');
          return;
        }
        setCurrentUser(u);
        
        // Load conversations
        const convos = await convex.query(api.messages.getConversations, {
          userId: u._id,
        });
        setConversations(convos as Conversation[]);
      } catch (err) {
        console.error('Failed to initialize:', err);
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  // Load thread when targetUserId changes
  useEffect(() => {
    if (!targetUserId || !currentUser) return;

    const loadThread = async () => {
      try {
        // Get partner info
        const partnerData = await convex.query(api.users.getById, {
          userId: targetUserId as Id<'users'>,
        });
        setPartner(partnerData as PartnerInfo | null);

        // Get messages
        const thread = await convex.query(api.messages.getThread, {
          userId: currentUser._id,
          partnerId: targetUserId as Id<'users'>,
        });
        setMessages(thread as Message[]);
      } catch (err) {
        console.error('Failed to load thread:', err);
      }
    };

    loadThread();
  }, [targetUserId, currentUser]);

  const sendMessage = async () => {
    if (!input.trim() || !currentUser || !targetUserId) return;

    setSending(true);
    haptic.tap();
    try {
      await convex.mutation(api.messages.send, {
        senderId: currentUser._id,
        receiverId: targetUserId as Id<'users'>,
        text: input.trim(),
      });
      
      haptic.success();
      setInput('');
      
      // Reload messages
      const thread = await convex.query(api.messages.getThread, {
        userId: currentUser._id,
        partnerId: targetUserId as Id<'users'>,
      });
      setMessages(thread as Message[]);
    } catch (err) {
      console.error('Failed to send message:', err);
      haptic.error();
      setError('failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handlePaymentClick = async () => {
    if (!currentUser || !targetUserId || !partner) return;
    
    haptic.tap();
    
    // Determine who is creator/business
    const isCurrentUserBusiness = currentUser.role === 'business';
    const isPartnerCreator = partner.role === 'creator';

    if (isCurrentUserBusiness && isPartnerCreator) {
      // Business paying creator - open payment flow
      await convex.mutation(api.messages.send, {
        senderId: currentUser._id,
        receiverId: targetUserId as Id<'users'>,
        text: '💰 sent payment request',
      });
    } else if (!isCurrentUserBusiness && partner.role === 'business') {
      // Creator requesting payment from business
      await convex.mutation(api.messages.send, {
        senderId: currentUser._id,
        receiverId: targetUserId as Id<'users'>,
        text: 'PAYMENT REQUEST',
      });
    }
  };

  if (loading) {
    return (
      <div className="app-container bg-bg min-h-screen flex items-center justify-center">
        <p className="text-muted font-mono text-sm">loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container bg-bg min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 font-mono text-xs mb-2">error</p>
          <p className="text-muted text-xs">{error}</p>
        </div>
      </div>
    );
  }

  // Thread view (when ?user=ID is in URL)
  if (targetUserId) {
    const isCurrentUserBusiness = currentUser?.role === 'business';
    const isPartnerCreator = partner?.role === 'creator';
    const showPayButton = isCurrentUserBusiness && isPartnerCreator;
    const showRequestButton = !isCurrentUserBusiness && partner?.role === 'business';

    return (
      <div className="app-container bg-bg min-h-screen flex flex-col pb-24">
        <header className="px-6 pt-14 pb-4 border-b border-border card-soft">
          <button
            onClick={() => {
              haptic.tap();
              router.push('/messages');
            }}
            className="mb-2 text-muted hover:text-text btn-soft"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-heading font-bold text-lg text-text">{partner?.username || 'user'}</h2>
        </header>

        <main className="flex-1 px-6 py-4 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-6xl mb-4">*</p>
              <p className="text-muted text-xs">start a conversation</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUser?._id;
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs px-3 py-2 rounded-[14px] text-xs ${
                        isMine
                          ? 'bg-text text-bg btn-soft-primary'
                          : 'bg-surface text-text border border-border btn-soft'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </main>

        {/* Payment / Request button + Message input */}
        <div className="px-6 py-3 border-t border-border bg-bg card-soft">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-surface border border-border px-3 py-2 rounded-[14px] text-xs text-text outline-none input-soft"
              placeholder="message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={sending}
            />
            {(showPayButton || showRequestButton) && (
              <button
                onClick={handlePaymentClick}
                className="px-3 py-2 bg-text text-bg rounded-full text-xs font-bold hover:opacity-80 btn-soft-primary"
                title={showPayButton ? 'Send payment request' : 'Request payment'}
              >
                {showPayButton ? 'PAY' : 'REQ'}
              </button>
            )}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="px-4 py-2 bg-text text-bg rounded-full text-xs font-bold disabled:opacity-50 btn-soft-primary"
            >
              send
            </button>
          </div>
        </div>

        <TabBar />
      </div>
    );
  }

  // Conversation list view (default)
  return (
    <div className="app-container bg-bg min-h-screen pb-24">
      <header className="px-6 pt-14 pb-4">
        <h1 className="font-heading font-bold text-3xl text-text">messages.</h1>
        <p className="text-muted text-xs font-mono">conversations & deals</p>
      </header>

      <main className="px-6 space-y-3">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-6xl mb-4">*</p>
            <p className="font-heading font-bold text-base text-text mb-1">no conversations yet</p>
            <p className="text-muted text-xs font-body max-w-[220px]">
              tap "chat & deal" on any profile to start a conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((convo, i) => (
              <motion.div
                key={String(convo.partnerId)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring.default, delay: i * 0.02 }}
                className="p-4 rounded-card bg-surface border border-border hover:border-text/40 transition-all cursor-pointer card-soft"
                onClick={() => {
                  haptic.tap();
                  router.push(`/messages?user=${convo.partnerId}`);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center font-heading font-bold text-text btn-soft">
                      {convo.partnerUsername?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-text">
                        {convo.partnerUsername}
                      </h3>
                      <p className="text-muted text-xs font-mono mt-0.5">
                        {convo.lastMessage?.text || 'no messages'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-dim">
                  <span className="text-muted">
                    {convo.lastMessage?.createdAt 
                      ? new Date(convo.lastMessage.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
                  </span>
                  <span className="text-text">open chat →</span>
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