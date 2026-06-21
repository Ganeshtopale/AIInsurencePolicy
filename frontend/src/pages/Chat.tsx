import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  User,
  Shield,
  Heart,
  TrendingUp,
  Car,
  Star,
  ChevronRight,
  MessageSquare,
  Sparkles,
  FileText,
  Phone,
  Clock,
  ThumbsUp,
  Info,
  X,
  CheckCircle,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { chatApi, authApi } from '@/services/api';
import FileUpload from '@/components/FileUpload';
import { useAuthStore } from '@/store';

type Message = {
  id: string;
  role: 'user' | 'bot' | 'agent';
  text: string;
  policy?: PolicyRecommendation;
};

type PolicyRecommendation = {
  id: string;
  name: string;
  provider: string;
  providerLogo?: string;
  premium: string;
  coverage: string;
  claimRatio: string;
  rating: number;
  type: string;
  badge?: string;
};

type SuggestedQuestion = {
  icon: React.ElementType;
  text: string;
};

const suggestedQuestions: SuggestedQuestion[] = [
  { icon: Shield, text: 'Which term insurance is best for me?' },
  { icon: Heart, text: 'Compare family health plans' },
  { icon: TrendingUp, text: 'Best investment plans for tax saving' },
  { icon: Car, text: 'Car insurance renewal help' },
  { icon: FileText, text: 'How to file a claim?' },
  { icon: Star, text: 'Top rated policies in 2026' },
];

const profileFields = [
  { label: 'Name', key: 'name', icon: User },
  { label: 'Age', key: 'age', icon: Calendar },
  { label: 'City', key: 'city', icon: MapPin },
  { label: 'Income', key: 'income', icon: DollarSign },
  { label: 'Family Size', key: 'family_size', icon: Users },
];

export default function Chat() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: "👋 Namaste! I'm your AI Insurance Advisor. I can help you find the best insurance policy for your needs. Tell me about yourself or ask me anything about insurance!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<PolicyRecommendation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [, setConversationId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || '', phone: user?.phone || '', profile_pic: user?.profile_pic || '', age: user?.age?.toString() || '', city: user?.city || '', income: user?.income || '', family_size: user?.family_size?.toString() || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Load existing conversation messages on mount
  useEffect(() => {
    if (!user) return;
    chatApi.getConversations().then(async (convs) => {
      if (convs.length === 0) return;
      const latest = convs[0];
      setConversationId(latest.id);
      const msgs = await chatApi.getConversationMessages(latest.id);
      if (msgs.length === 0) return;
      const mapped: Message[] = msgs.map((m) => ({
        id: m.id,
        role: m.role === 'assistant' || m.role === 'bot' ? 'bot' : m.role === 'agent' ? 'agent' : 'user',
        text: m.content,
      }));
      setMessages((prev) => {
        const existing = prev.length > 1 ? prev : [];
        return [...existing, ...mapped];
      });
    }).catch(() => {});
  }, [user]);

  // WebSocket for real-time agent messages
  useEffect(() => {
    if (!user) return;
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/ws/customer/${user.id}`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'agent', text: data.content }]);
        }
      } catch {}
    };
    return () => ws.close();
  }, [user?.id]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: msg }]);
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      const res = await chatApi.sendMessage({ message: msg, session_id: sessionId || undefined });
      if (res.session_id) setSessionId(res.session_id);
      if (res.conversation_id) setConversationId(res.conversation_id);
      const botText = res.message?.content || 'Here are some policies that might interest you. Would you like more details about any specific plan?';
      const metaPolicies = res.message?.metadata?.policies;
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'bot',
        text: botText,
        policy: metaPolicies?.[0] ? {
          id: metaPolicies[0].id,
          name: metaPolicies[0].name,
          provider: metaPolicies[0].provider_name || metaPolicies[0].provider,
          providerLogo: metaPolicies[0].provider_logo || undefined,
          premium: `₹${metaPolicies[0].premium}/month`,
          coverage: metaPolicies[0].coverageAmount ? `₹${(metaPolicies[0].coverageAmount / 100000).toFixed(0)}L` : '—',
          claimRatio: metaPolicies[0].claimSettlementRatio ? `${metaPolicies[0].claimSettlementRatio}%` : '—',
          rating: metaPolicies[0].rating || 0,
          type: metaPolicies[0].type || 'term',
        } : undefined,
      }]);
    } catch {
      const lower = msg.toLowerCase();
      let botText = 'Great question! Let me look into that for you. Here are some popular policies you might find helpful.';
      let policyType = 'term';
      if (lower.includes('health') || lower.includes('medical')) policyType = 'health';
      else if (lower.includes('investment') || lower.includes('saving') || lower.includes('tax')) policyType = 'investment';
      else if (lower.includes('car') || lower.includes('motor')) policyType = 'car';

      if (policyType === 'health') {
        botText = 'For health insurance, I recommend looking at plans with comprehensive coverage including pre-existing diseases after 2-3 years. Here\'s a top pick:';
      } else if (policyType === 'investment') {
        botText = 'Investment plans help you grow wealth while providing insurance coverage. Here\'s a top-rated plan with excellent returns:';
      } else if (policyType === 'car') {
        botText = 'For car insurance, you can save up to 35% on your renewal. Here\'s a popular option with high claim settlement ratio:';
      }

      const fallbackPolicy: PolicyRecommendation = {
        id: '1',
        name: policyType === 'health' ? 'Complete Health Shield' : policyType === 'investment' ? 'Wealth Growth Plan' : policyType === 'car' ? 'Motor Protect' : 'Smart Term Plan',
        provider: policyType === 'health' ? 'Star Health' : policyType === 'investment' ? 'ICICI Prudential' : policyType === 'car' ? 'Bajaj Allianz' : 'HDFC Life',
        premium: policyType === 'car' ? '₹7,500/year' : policyType === 'health' ? '₹1,250/month' : policyType === 'investment' ? '₹2,500/month' : '₹456/month',
        coverage: policyType === 'car' ? 'IDV ₹5 Lakh' : policyType === 'health' ? '₹10 Lakh' : policyType === 'investment' ? '₹20 Lakh' : '₹1 Crore',
        claimRatio: policyType === 'car' ? '96.3%' : policyType === 'health' ? '95.6%' : policyType === 'investment' ? '94.1%' : '98.2%',
        rating: policyType === 'car' ? 4.5 : policyType === 'health' ? 4.7 : policyType === 'investment' ? 4.6 : 4.8,
        type: policyType,
        badge: policyType === 'health' ? 'Popular' : policyType !== 'car' ? 'Best Seller' : undefined,
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'bot', text: botText, policy: fallbackPolicy }]);
        setIsTyping(false);
      }, 1200);
      return;
    }
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (q: string) => {
    handleSend(q);
  };

  const handleViewDetails = (policy: PolicyRecommendation) => {
    setSelectedRecommendation(policy);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'term': return Shield;
      case 'health': return Heart;
      case 'investment': return TrendingUp;
      case 'car': return Car;
      default: return Shield;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'term': return 'text-blue-600 bg-blue-50';
      case 'health': return 'text-orange-600 bg-orange-50';
      case 'investment': return 'text-green-600 bg-green-50';
      case 'car': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 pt-16 lg:pt-28">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-orange-500">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">AI Insurance Advisor</h2>
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Online
              </span>
            </div>
            <p className="text-xs text-gray-400">Powered by PolicyBazaar AI</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="h-4 w-4 text-orange-400" />
            AI-powered
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={clsx('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {(msg.role === 'bot' || msg.role === 'agent') && (
                  <div className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', msg.role === 'agent' ? 'bg-orange-100' : 'bg-gradient-to-br from-blue-600 to-orange-500')}>
                    {msg.role === 'agent' ? <User className="h-4 w-4 text-orange-600" /> : <Bot className="h-4 w-4 text-white" />}
                  </div>
                )}

                <div className={clsx('max-w-[75%]', msg.role === 'user' && 'order-first')}>
                  {msg.role === 'user' ? (
                    <div className="rounded-2xl rounded-tr-none bg-blue-600 px-4 py-3 shadow-sm">
                      <p className="text-sm leading-relaxed text-white">{msg.text}</p>
                    </div>
                  ) : (
                    <div className={clsx('rounded-2xl rounded-tl-none p-4 shadow-sm', msg.role === 'agent' ? 'bg-orange-50' : 'bg-white')}>
                      {msg.role === 'agent' && (
                        <p className="mb-1 text-xs font-semibold text-orange-600">Agent</p>
                      )}
                      <p className="text-sm leading-relaxed text-gray-700">{msg.text}</p>

                      {msg.policy && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                          className="mt-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', getTypeColor(msg.policy.type))}>
                                {React.createElement(getTypeIcon(msg.policy.type), { className: 'h-5 w-5' })}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">{msg.policy.name}</h4>
                                  {msg.policy.badge && (
                                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">{msg.policy.badge}</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">{msg.policy.provider}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewDetails(msg.policy!)}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                            >
                              View Details
                            </button>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-blue-100 pt-3 text-center text-xs">
                            <div><span className="font-semibold text-gray-900">{msg.policy.premium}</span><p className="text-gray-400">Premium</p></div>
                            <div><span className="font-semibold text-gray-900">{msg.policy.coverage}</span><p className="text-gray-400">Coverage</p></div>
                            <div><span className="font-semibold text-gray-900">{msg.policy.claimRatio}</span><p className="text-gray-400">Claim Ratio</p></div>
                          </div>
                        </motion.div>
                      )}

                      {msg === messages[messages.length - 1] && !isTyping && msg.role === 'bot' && (
                        <div className="mt-3 flex items-center gap-2">
                          <button className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 transition hover:bg-gray-50">
                            <ThumbsUp className="h-3 w-3" /> Helpful
                          </button>
                          <button className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 transition hover:bg-gray-50">
                            <Info className="h-3 w-3" /> Ask more
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-orange-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-none bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        <AnimatePresence>
          {showSuggestions && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex gap-2 overflow-x-auto border-t border-gray-100 bg-white px-6 py-3"
            >
              {suggestedQuestions.map((q) => (
                <button
                  key={q.text}
                  onClick={() => handleSuggestionClick(q.text)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition hover:border-blue-300 hover:text-blue-600"
                >
                  <q.icon className="h-3.5 w-3.5" />
                  {q.text}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about insurance plans, premiums, claims..."
              className="flex-1 border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={clsx(
                'flex h-8 w-8 items-center justify-center rounded-lg transition',
                input.trim() && !isTyping ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400',
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            AI responses are for guidance. Always verify with official policy documents.
          </p>
        </div>
      </div>

      <div className="hidden w-80 flex-col border-l border-gray-200 bg-white lg:flex">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            {user?.profile_pic ? (
              <img src={user.profile_pic} alt="" className="h-8 w-8 rounded-full object-cover" onError={e => (e.target as HTMLImageElement).style.display='none'} />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600"><User className="h-4 w-4" /></div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{user?.name || 'Guest'}</h3>
              <p className="text-xs text-gray-400">{user?.email || 'Not logged in'}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Personal Details</h4>
          <div className="space-y-3">
            {profileFields.map((f) => {
              const val = user ? (user as any)[f.key] : null;
              return (
                <div key={f.key} className="flex items-center justify-between border-b border-gray-50 pb-2 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500"><f.icon className="h-3.5 w-3.5" />{f.label}</span>
                  <span className="font-medium text-gray-900">{val || '—'}</span>
                </div>
              );
            })}
          </div>

          <button onClick={() => { setProfileMsg(''); setEditForm({ name: user?.name || '', phone: user?.phone || '', profile_pic: user?.profile_pic || '', age: user?.age?.toString() || '', city: user?.city || '', income: user?.income || '', family_size: user?.family_size?.toString() || '' }); setShowEditProfile(true); }} className="mt-4 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50">
            Edit Profile
          </button>

          <div className="mt-6">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Quick Links</h4>
            <div className="space-y-2">
              {[
                { icon: FileText, label: 'My Policies', href: '/policies' },
                { icon: MessageSquare, label: 'Previous Chats', href: '/chat' },
                { icon: Phone, label: 'Contact Support', href: 'tel:8669065575' },
                { icon: Clock, label: 'Claim History', href: '/dashboard' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-blue-600"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                  <ChevronRight className="ml-auto h-3 w-3 text-gray-300" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="rounded-xl bg-gradient-to-br from-orange-50 to-blue-50 p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold text-gray-900">Need urgent help?</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Call our customer support</p>
            <a href="tel:8669065575" className="mt-2 inline-block font-semibold text-blue-600">8669065575</a>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedRecommendation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedRecommendation(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl', getTypeColor(selectedRecommendation.type))}>
                    {React.createElement(getTypeIcon(selectedRecommendation.type), { className: 'h-6 w-6' })}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedRecommendation.name}</h3>
                    <p className="text-sm text-gray-500">{selectedRecommendation.provider}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRecommendation(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">Monthly Premium</p>
                  <p className="text-lg font-bold text-gray-900">{selectedRecommendation.premium}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">Coverage Amount</p>
                  <p className="text-lg font-bold text-gray-900">{selectedRecommendation.coverage}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">Claim Settlement Ratio</p>
                  <p className="text-lg font-bold text-green-600">{selectedRecommendation.claimRatio}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                    <span className="text-lg font-bold text-gray-900">{selectedRecommendation.rating}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  <span>Free-look period of 15 days</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  <span>Tax benefits under Section 80C & 80D</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  <span>Online claim submission with 3-day turnaround</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <a
                  href={`/checkout?policy=${selectedRecommendation.id}`}
                  className="flex-1 rounded-lg bg-orange-500 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
                >
                  Buy Now
                </a>
                <a
                  href={`/compare?policy=${selectedRecommendation.id}`}
                  className="flex-1 rounded-lg border border-blue-200 py-3 text-center font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Compare Plans
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowEditProfile(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
              <button onClick={() => setShowEditProfile(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <FileUpload currentUrl={editForm.profile_pic} onUploaded={(url) => setEditForm({...editForm, profile_pic: url})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} maxLength={10} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                  <input value={editForm.income} onChange={e => setEditForm({...editForm, income: e.target.value})} placeholder="e.g. 5-10 Lakhs" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Family Size</label>
                  <input value={editForm.family_size} onChange={e => setEditForm({...editForm, family_size: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
              {profileMsg && (
                <div className={`rounded-lg p-3 text-sm ${profileMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{profileMsg}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEditProfile(false)} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button
                  onClick={async () => {
                    if (!editForm.name.trim()) { setProfileMsg('Name is required'); return }
                    setSavingProfile(true); setProfileMsg('')
                    try {
                      const updated = await authApi.updateProfile({
                        name: editForm.name, phone: editForm.phone || undefined, profile_pic: editForm.profile_pic || undefined,
                        age: editForm.age ? Number(editForm.age) : undefined, city: editForm.city || undefined,
                        income: editForm.income || undefined, family_size: editForm.family_size ? Number(editForm.family_size) : undefined,
                      })
                      useAuthStore.getState().setUser(updated)
                      setProfileMsg('Profile updated successfully')
                      setTimeout(() => setShowEditProfile(false), 1200)
                    } catch (err: any) {
                      setProfileMsg(err?.response?.data?.detail || 'Update failed')
                    }
                    setSavingProfile(false)
                  }}
                  disabled={!editForm.name.trim() || savingProfile}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
                >
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
