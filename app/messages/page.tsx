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
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [pendingOffer, setPendingOffer] = useState<any>(null);
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

        // Check for pending offers
        const offers = await convex.query(api.offers.getBetweenUsers, {
          userId1: currentUser._id,
          userId2: targetUserId as Id<'users'>,
        });
        
        // Find pending offer sent TO current user (creator receiving offer from business)
        const incomingPending = offers.find(
          (o: any) => o.toUserId === currentUser._id && o.status === 'pending'
        );
        setPendingOffer(incomingPending || null);
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

  const handleSendOffer = async () => {
    if (!currentUser || !targetUserId || !offerAmount) return;
    
    const amount = parseInt(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('please enter a valid amount');
      return;
    }

    haptic.tap();
    try {
      await convex.mutation(api.offers.create, {
        fromUserId: currentUser._id,
        toUserId: targetUserId as Id<'users'>,
        amount,
      });

      haptic.success();
      setShowOfferInput(false);
      setOfferAmount('');
      
      // Send system message
      await convex.mutation(api.messages.send, {
        senderId: currentUser._id,
        receiverId: targetUserId as Id<'users'>,
        text: `💰 offered ₹${amount.toLocaleString()} for gig`,
      });

      // Reload messages
      const thread = await convex.query(api.messages.getThread, {
        userId: currentUser._id,
        partnerId: targetUserId as Id<'users'>,
      });
      setMessages(thread as Message[]);
    } catch (err) {
      console.error('Failed to send offer:', err);
      haptic.error();
      alert('failed to send offer');
    }
  };

  const handleRequestPayment = async () => {
    if (!currentUser || !targetUserId) return;
    
    haptic.tap();
    try {
      await convex.mutation(api.messages.send, {
        senderId: currentUser._id,
        receiverId: targetUserId as Id<'users'>,
        text: '💸 payment requested',
      });

      haptic.success();
      
      // Reload messages
      const thread = await convex.query(api.messages.getThread, {
        userId: currentUser._id,
        partnerId: targetUserId as Id<'users'>,
      });
      setMessages(thread as Message[]);
    } catch (err) {
      console.error('Failed to request payment:', err);
      haptic.error();
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!currentUser || !targetUserId) return;
    
    haptic.success();
    try {
      await convex.mutation(api.offers.accept, {
        offerId: offerId as Id<'offers'>,
        userId: currentUser._id,
      });

      // Send acceptance message
      await convex.mutation(api.messages.send, {
        senderId: currentUser._id,
        receiverId: targetUserId as Id<'users'>,
        text: '✅ offer accepted! let\'s get started.',
      });

      setPendingOffer(null);
      
      // Reload messages
      const thread = await convex.query(api.messages.getThread, {
        userId: currentUser._id,
        partnerId: targetUserId as Id<'users'>,
      });
      setMessages(thread as Message[]);
    } catch (err) {
      console.error('Failed to accept offer:', err);
      haptic.error();
      alert('failed to accept offer');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    if (!currentUser || !targetUserId) return;
    
    haptic.tap();
    try {
      await convex.mutation(api.offers.reject, {
        offerId: offerId as Id<'offers'>,
        userId: currentUser._id,
      });

      // Send rejection message
      await convex.mutation(api.messages.send, {
        senderId: currentUser._id,
        receiverId: targetUserId as Id<'users'>,
        text: '❌ offer not accepted.',
      });

      setPendingOffer(null);
      
      // Reload messages
      const thread = await convex.query(api.messages.getThread, {
        userId: currentUser._id,
        partnerId: targetUserId as Id<'users'>,
      });
      setMessages(thread as Message[]);
    } catch (err) {
      console.error('Failed to reject offer:', err);
      haptic.error();
      alert('failed to reject offer');
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
      <div className="app-container bg-bg min-h-screen flex flex-col">
        <header className="px-6 pt-14 pb-4">
          <button
            onClick={() => {
              haptic.tap();
              router.push('/messages');
            }}
            className="mb-2 text-muted hover:text-text"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-heading font-bold text-lg text-text">{partner?.username || 'user'}</h2>
        </header>

        <main className="flex-1 px-6 py-4 overflow-y-auto space-y-2 pb-32">
          {/* Pending offer banner (creator sees this when business sent an offer) */}
          {pendingOffer && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-elevated rounded-[14px] p-4 mb-4"
            >
              <p className="text-xs text-muted mb-2">incoming offer</p>
              <p className="text-text font-heading font-bold text-lg mb-3">₹{pendingOffer.amount.toLocaleString()}</p>
              <div className="flex gap-2">
                <motion.button
                  onClick={() => handleAcceptOffer(pendingOffer._id)}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-full font-heading font-bold text-sm"
                  whileHover={{ scale: 1.05, backgroundColor: '#16a34a' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  W offer
                </motion.button>
                <motion.button
                  onClick={() => handleRejectOffer(pendingOffer._id)}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-full font-heading font-bold text-sm"
                  whileHover={{ scale: 1.05, backgroundColor: '#dc2626' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  L offer
                </motion.button>
              </div>
            </motion.div>
          )}

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
                          ? 'bg-text text-bg'
                          : 'bg-surface text-text'
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

        {/* Offer input or Message input */}
        <div className="fixed bottom-14 left-0 right-0 px-6 py-3 bg-bg border-t border-border z-50">
          {showOfferInput ? (
            /* Business offer input */
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-text text-sm">₹</span>
                <input
                  type="number"
                  className="flex-1 bg-surface px-3 py-2 rounded-[14px] text-sm text-text outline-none"
                  placeholder="enter amount..."
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOffer()}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowOfferInput(false);
                    setOfferAmount('');
                  }}
                  className="flex-1 py-2 rounded-full text-xs font-mono text-muted hover:bg-surface transition-colors"
                >
                  cancel
                </button>
                <button
                  onClick={handleSendOffer}
                  disabled={!offerAmount}
                  className="flex-1 bg-text text-bg py-2 rounded-full text-xs font-bold disabled:opacity-50"
                >
                  send offer
                </button>
              </div>
            </div>
          ) : (
            /* Normal message input */
            <div className="flex gap-2">
              <input
                className="flex-1 bg-surface border border-border px-3 py-2 rounded-[14px] text-xs text-text outline-none"
                placeholder="message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={sending}
              />
              {showPayButton && (
                <button
                  onClick={() => setShowOfferInput(true)}
                  className="px-4 py-2 bg-elevated text-text rounded-full text-xs font-bold hover:bg-surface transition-colors"
                  title="Send offer"
                >
                  offer
                </button>
              )}
              {showRequestButton && (
                <button
                  onClick={handleRequestPayment}
                  className="px-3 py-2 bg-elevated border border-border text-text rounded-full text-xs font-bold hover:bg-surface"
                  title="Request payment"
                >
                  request payment
                </button>
              )}
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="px-4 py-2 bg-text text-bg rounded-full text-xs font-bold disabled:opacity-50"
              >
                send
              </button>
            </div>
          )}
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
                className="p-4 rounded-card bg-surface hover:bg-elevated transition-all cursor-pointer"
                onClick={() => {
                  haptic.tap();
                  router.push(`/messages?user=${convo.partnerId}`);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center font-heading font-bold text-text">
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
                <div className="mt-3 pt-2.5 flex items-center justify-between text-[11px] font-mono text-dim">
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