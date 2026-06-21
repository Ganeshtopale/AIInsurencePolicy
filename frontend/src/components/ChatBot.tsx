import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
} from 'lucide-react'
import clsx from 'clsx'

interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface QuickReply {
  label: string
  value: string
}

const quickReplies: QuickReply[] = [
  { label: 'Best Health Insurance', value: 'What is the best health insurance plan for a family of 4?' },
  { label: 'Term Life Quote', value: 'I want a term life insurance quote for 1 crore coverage' },
  { label: 'Compare Plans', value: 'Compare top 3 health insurance plans' },
  { label: 'Claim Support', value: 'How do I file an insurance claim?' },
  { label: 'Car Insurance', value: 'Best car insurance with zero dep coverage' },
  { label: 'Discounts', value: 'Are there any ongoing discounts or offers?' },
  { label: 'Travel Insurance', value: 'Suggest travel insurance for Schengen visa' },
  { label: 'Tax Benefits', value: 'What tax benefits do I get on insurance premiums?' },
  { label: 'Bike Insurance', value: 'Renew my bike insurance online' },
  { label: 'Senior Citizen Plans', value: 'Health insurance for parents above 60 years' },
  { label: 'Critical Illness', value: 'Show me critical illness insurance plans' },
  { label: 'Child Plans', value: 'Best investment + insurance plans for children' },
]

const botAvatar = (
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-insurance-orange-500 to-insurance-orange-600 shadow-sm shrink-0">
    <Bot className="h-4 w-4 text-white" />
  </div>
)

const userAvatar = (
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-insurance-blue-600 shadow-sm shrink-0">
    <User className="h-4 w-4 text-white" />
  </div>
)

function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function getBotResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase()
  if (msg.includes('health') || msg.includes('medical') || msg.includes('family of 4')) {
    return 'Based on your needs, I recommend our **Health Insurance Plus** plan. It offers:\n\n• Cashless hospitalization at 10,000+ network hospitals\n• Coverage up to ₹25 lakhs\n• No waiting period for 100+ diseases\n• Starting from just ₹8,900/year for a family of 4\n\nWould you like a detailed premium quote?'
  }
  if (msg.includes('term') || msg.includes('life') || msg.includes('1 crore')) {
    return 'Great choice! Here are the top **Term Life Plans**:\n\n1. **SecureFuture Term Plan** - ₹1Cr cover at ₹456/month\n2. **FamilyProtect Plus** - ₹1Cr cover at ₹523/month\n3. **WealthSecure Term** - ₹1Cr cover + returns at ₹689/month\n\nAll plans include terminal illness cover and tax benefits under 80C & 10(10D).'
  }
  if (msg.includes('car') || msg.includes('vehicle') || msg.includes('auto') || msg.includes('zero dep')) {
    return 'Here are the best **Car Insurance** options:\n\n• **Zero Depreciation Cover** starting ₹2,094/year\n• **Comprehensive Plan** with roadside assistance\n• **Third Party** from just ₹894/year\n\nKey benefits: NCB protection, cashless repairs at 8,000+ garages, instant claim settlement under 60 minutes.'
  }
  if (msg.includes('claim')) {
    return 'Filing a claim is simple with InsuranceBazaar:\n\n1. **Log in** to your account\n2. Go to **My Policies** > **Raise Claim**\n3. Fill the claim form & upload documents\n4. Track claim status in real-time\n\nOr call our 24/7 claim support at **8669065575** for immediate assistance.'
  }
  if (msg.includes('compare') || msg.includes('best')) {
    return "I'd be happy to compare plans for you! Could you tell me:\n\n1. **Type** - Health, Life, Car, or Travel?\n2. **Coverage** - How much cover do you need?\n3. **Age** - Age of the person(s) to be insured?\n\nThis will help me find the most accurate comparison!"
  }
  if (msg.includes('discount') || msg.includes('offer') || msg.includes('deal')) {
    return 'Yes! We have exciting **Festive Offers** running now:\n\n🎉 **Health Plans**: Upto 25% discount + 1 month free\n🎉 **Term Plans**: Free health checkup worth ₹3,000\n🎉 **Car Insurance**: 35% off on comprehensive plans\n🎉 **Travel Insurance**: 20% off on family packages\n\nUse code: **BAZAAR25** for additional 5% off!'
  }
  if (msg.includes('travel') || msg.includes('schengen') || msg.includes('visa')) {
    return '**Travel Insurance for Schengen Visa**:\n\n• **Schengen Visa Compliant** - ₹50,000 medical coverage\n• **Worldwide Plans** from ₹349/day\n• Covers trip cancellation, baggage loss, passport loss\n• 24x7 emergency assistance globally\n\nPlans approved by all Schengen embassies. Need coverage for how many days?'
  }
  if (msg.includes('tax') || msg.includes('80c') || msg.includes('80d')) {
    return '**Tax Benefits on Insurance**:\n\n• **Health Insurance**: Up to ₹25,000 deduction u/s 80D\n• **Term Life**: Up to ₹1.5 lakh deduction u/s 80C\n• **Maturity Claims**: Tax-free u/s 10(10D)\n• **Senior Citizens**: Extra ₹50,000 deduction for parents\n\nMax you can save: ₹2.25 lakh annually on taxes!'
  }
  if (msg.includes('bike') || msg.includes('two wheeler')) {
    return '**Bike Insurance Renewal**:\n\n• **Comprehensive**: From ₹999/year with zero dep\n• **Third Party**: From ₹714/year mandatory cover\n• **Instant Policy** - Renew in 2 minutes\n• NCB up to 50% on claim-free years\n\nJust share your registration number for instant quote.'
  }
  if (msg.includes('senior') || msg.includes('parents') || msg.includes('60')) {
    return '**Senior Citizen Health Plans**:\n\n• **SeniorCare Plus**: ₹5L cover, no medical test up to 65\n• **GoldShield 60+**: Covers pre-existing from day 1\n• Premium from ₹12,400/year for 2 seniors\n• Cashless at 12,000+ hospitals\n\nCo-pay options available to reduce premium.'
  }
  if (msg.includes('critical') || msg.includes('cancer') || msg.includes('illness')) {
    return '**Critical Illness Plans**:\n\n• **Lump sum payout** up to ₹1 Cr on diagnosis\n• Covers 25+ critical illnesses including cancer, heart attack\n• **No hospital bills needed** - direct payout\n• Premium from ₹4,200/year for ₹10L cover\n\nCan be added as rider to term plan too.'
  }
  if (msg.includes('child') || msg.includes('children') || msg.includes('education')) {
    return '**Child Plans - Insurance + Investment**:\n\n• **EduSecure Plan**: ₹25L maturity for education\n• **Future Builder**: Market-linked returns + life cover\n• Premium waiver benefit if parent not around\n• Tax benefits u/s 80C & 10(10D)\n\nStart from ₹3,000/month. What\'s your child\'s age?'
  }
  return 'Thank you for reaching out! I\'m here to help you find the best insurance plan. Here\'s what I can assist you with:\n\n• **Compare Plans** - Side-by-side comparison of policies\n• **Premium Quotes** - Instant premium calculation\n• **Claim Support** - Guide you through the claim process\n• **Policy Advice** - Recommend the best plan for your needs\n\nWhat would you like help with today?'
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      content:
        "👋 Hello! I'm **InsuranceBazaar AI Advisor**.\n\nI can help you compare plans, get quotes, and find the best insurance for your needs. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSend = (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText) return

    setShowQuickReplies(false)

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(
      () => {
        const botMsg: ChatMessage = {
          id: generateId(),
          role: 'bot',
          content: getBotResponse(messageText),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMsg])
        setIsTyping(false)
      },
      1200 + Math.random() * 800
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' &&!e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content.replace(/\*\*/g, ''))
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedback((prev) => ({...prev, [id]: type }))
    // TODO: send to analytics API
  }

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-insurance-dark-900">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',
          isOpen
          ? 'bg-insurance-dark-800 rotate-90'
            : 'bg-gradient-to-r from-insurance-orange-500 to-insurance-orange-600'
        )}
        aria-label={isOpen? 'Close chat' : 'Open chat'}
      >
        {isOpen? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
      </motion.button>

      {/* Notification dot */}
      {!isOpen && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-16 right-6 z-50 flex h-5 w-5 items-center justify-center rounded-full bg-insurance-red-500 text-[10px] font-bold text-white shadow-sm pointer-events-none"
        >
          1
        </motion.span>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 flex w-[380px] max-w-[calc(100vw-32px)] flex-col rounded-2xl bg-white shadow-2xl border border-insurance-dark-100 overflow-hidden"
            style={{ height: 'min(600px, calc(100vh - 140px))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-insurance-orange-500 to-insurance-orange-600 px-4 py-3.5 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">AI Insurance Advisor</h3>
                  <p className="text-[11px] text-orange-100 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-400 inline-block" />
                    Online • Instant reply
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Minimize chat"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-insurance-dark-50/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={clsx('flex gap-3', msg.role === 'user'? 'flex-row-reverse' : 'flex-row')}
                >
                  {msg.role === 'bot'? botAvatar : userAvatar}
                  <div className={clsx('group max-w-[75%]', msg.role === 'user'? 'items-end' : 'items-start')}>
                    <div
                      className={clsx(
                        'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                        msg.role === 'user'
                        ? 'bg-insurance-blue-600 text-white rounded-tr-sm'
                          : 'bg-white text-insurance-dark-700 rounded-tl-sm shadow-sm border border-insurance-dark-100'
                      )}
                    >
                      {renderMessageContent(msg.content)}
                    </div>
                    <div
                      className={clsx(
                        'flex items-center gap-1 mt-1',
                        msg.role === 'user'? 'justify-end' : 'justify-start'
                      )}
                    >
                      <span className="text-[10px] text-insurance-dark-400">
                        {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'bot' && (
                        <div className="hidden group-hover:flex items-center gap-0.5">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="p-1 rounded hover:bg-insurance-dark-100 text-insurance-dark-400 hover:text-insurance-dark-600 transition-colors"
                            title="Copy"
                            aria-label="Copy message"
                          >
                            {copiedId === msg.id? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'up')}
                            className={clsx(
                              'p-1 rounded hover:bg-insurance-dark-100 transition-colors',
                              feedback[msg.id] === 'up'
                              ? 'text-green-600'
                                : 'text-insurance-dark-400 hover:text-insurance-dark-600'
                            )}
                            title="Helpful"
                            aria-label="Mark as helpful"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'down')}
                            className={clsx(
                              'p-1 rounded hover:bg-insurance-dark-100 transition-colors',
                              feedback[msg.id] === 'down'
                              ? 'text-red-600'
                                : 'text-insurance-dark-400 hover:text-insurance-dark-600'
                            )}
                            title="Not helpful"
                            aria-label="Mark as not helpful"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  {botAvatar}
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm border border-insurance-dark-100">
                    <div className="flex gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full bg-insurance-dark-300 animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-insurance-dark-300 animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-insurance-dark-300 animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick replies */}
              {showQuickReplies && messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="mt-2"
                >
                  <p className="text-[11px] font-medium text-insurance-dark-400 mb-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-insurance-orange-500" />
                    Suggested questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickReplies.map((qr) => (
                      <button
                        key={qr.value}
                        onClick={() => handleSend(qr.value)}
                        className="rounded-full border border-insurance-dark-200 bg-white px-3 py-1.5 text-xs font-medium text-insurance-dark-600 hover:border-insurance-orange-300 hover:bg-insurance-orange-50 hover:text-insurance-orange-600 transition-all"
                      >
                        {qr.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-insurance-dark-100 bg-white px-4 py-3 shrink-0">
              <div className="flex items-center gap-2 rounded-xl border border-insurance-dark-200 bg-insurance-dark-50/50 px-3 py-1 focus-within:border-insurance-orange-400 focus-within:ring-1 focus-within:ring-insurance-orange-400 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border-0 bg-transparent py-2 text-sm text-insurance-dark-900 placeholder-insurance-dark-400 outline-none focus:ring-0"
                  aria-label="Chat message input"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-insurance-orange-500 text-white hover:bg-insurance-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-insurance-dark-400 text-center">
                AI responses are for guidance only. Verify with our experts before purchase.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


