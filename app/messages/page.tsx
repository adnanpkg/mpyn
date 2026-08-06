'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, ArrowLeft, User } from 'lucide-react';
import TabBar from '@/components/tab-bar';
import { supabase } from '@/lib/supabase';
import { haptic, pressScale } from '@/lib/haptics';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      if (targetUserId) {
        // Fetch existing conversation messages
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        setMessages(data || []);
        scrollToBottom();

        // Subscribe to real-time incoming messages
        const channel = supabase
          .channel('realtime_chat')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
              const newMsg = payload.new as Message;
              if (
                (newMsg.sender_id === user.id && newMsg.receiver_id === targetUserId) ||
                (newMsg.sender_id === targetUserId && newMsg.receiver_id === user.id)
              ) {
                setMessages((prev) => [...prev, newMsg]);
                scrollToBottom();
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
      setLoading(false);
    };

    initChat();
  }, [targetUserId]);

  const sendMessage = async () => {
    if (!input.trim() || !currentUserId || !targetUserId) return;
    const textToSend = input.trim();
    setInput('');
    haptic.tap();

    const tempMsg: Message = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      receiver_id: targetUserId,
      text: textToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    try {
      await supabase.from('messages').insert({
        sender_id: currentUserId,
        receiver_id: targetUserId,
        text: textToSend,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to send message:', e);
    }
  };

  if (targetUserId) {
    return (
      <div className="app-container bg-bg min-h-screen flex flex-col justify-between pb-4">
        {/* Chat Header */}
        <header className="px-6 pt-14 pb-4 border-b border-border flex items-center gap-3 bg-surface/80 backdrop-blur sticky top-0 z-20">
          <button onClick={() => window.history.back()} className="text-muted hover:text-text">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center font-bold text-xs">
            <User size={14} />
          </div>
          <div>
            <h2 className="font-heading font-bold text-sm text-text">Direct Message</h2>
            <p className="text-[10px] font-mono text-muted">online</p>
          </div>
        </header>

        {/* Chat Messages */}
        <main className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-center text-xs font-mono text-dim py-12">
              say hi to start the gig conversation! ✳
            </p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
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

        {/* Chat Input Bar */}
        <div className="px-6 pt-2">
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

  return (
    <div className="app-container bg-bg pb-24 min-h-screen">
      <header className="px-6 pt-14 pb-4">
        <h1 className="font-heading font-bold text-3xl text-text">messages.</h1>
        <p className="text-muted text-xs font-mono">conversations & deals</p>
      </header>

      <main className="px-6 py-12 text-center">
        <span className="text-4xl mb-3">💬</span>
        <p className="font-heading font-bold text-base text-text mb-1">select a creator or business</p>
        <p className="text-muted text-xs font-body max-w-[220px] mx-auto">
          tap &apos;chat & deal&apos; on any profile in your home feed to open a direct chat.
        </p>
      </main>
      <TabBar />
    </div>
  );
}

