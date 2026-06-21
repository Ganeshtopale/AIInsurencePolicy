import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Zap,
  Shield,
  Activity,
  Star,
} from 'lucide-react'
import clsx from 'clsx'

interface LeadScore {
  overall: number
  intent: number
  affordability: number
  urgency: number
  trust: number
  engagement: number
  breakdown?: {
    category: string
    score: number
    maxScore: number
    weight: number
  }[]
}

interface LeadData {
  id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  age?: number
  gender?: string
  insuranceType?: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'closed'
  score?: LeadScore
  aiSummary?: string
  purchaseProbability?: number
  notes?: string
  createdAt: string
  lastActivity?: string
}

interface LeadCardProps {
  lead: LeadData
  onAssign?: (leadId: string) => void
  onContact?: (leadId: string) => void
  onConvert?: (leadId: string) => void
  className?: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  new: { label: 'New', color: 'text-insurance-blue-600', bg: 'bg-insurance-blue-100', icon: Zap },
  contacted: { label: 'Contacted', color: 'text-insurance-orange-600', bg: 'bg-insurance-orange-100', icon: Phone },
  qualified: { label: 'Qualified', color: 'text-insurance-green-600', bg: 'bg-insurance-green-100', icon: CheckCircle },
  proposal: { label: 'Proposal', color: 'text-insurance-blue-600', bg: 'bg-insurance-blue-100', icon: Target },
  negotiation: { label: 'Negotiation', color: 'text-insurance-orange-600', bg: 'bg-insurance-orange-100', icon: TrendingUp },
  won: { label: 'Won', color: 'text-insurance-green-600', bg: 'bg-insurance-green-100', icon: Star },
  lost: { label: 'Lost', color: 'text-insurance-red-600', bg: 'bg-insurance-red-100', icon: XCircle },
  closed: { label: 'Closed', color: 'text-insurance-dark-500', bg: 'bg-insurance-dark-100', icon: XCircle },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-insurance-green-500'
  if (score >= 60) return 'text-insurance-orange-500'
  if (score >= 40) return 'text-insurance-orange-400'
  return 'text-insurance-red-500'
}

function getScoreCircleColor(score: number): string {
  if (score >= 80) return 'stroke-insurance-green-500'
  if (score >= 60) return 'stroke-insurance-orange-500'
  if (score >= 40) return 'stroke-insurance-orange-400'
  return 'stroke-insurance-red-500'
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-insurance-green-50 text-insurance-green-700 border-insurance-green-200'
  if (score >= 60) return 'bg-insurance-orange-50 text-insurance-orange-700 border-insurance-orange-200'
  if (score >= 40) return 'bg-insurance-orange-50/50 text-insurance-orange-600 border-insurance-orange-200'
  return 'bg-insurance-red-50 text-insurance-red-600 border-insurance-red-200'
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function LeadCard({ lead, onAssign, onContact, onConvert, className }: LeadCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const status = statusConfig[lead.status] || statusConfig.new

  const score = lead.score?.overall ?? 0
  const circumference = 2 * Math.PI * 36
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <motion.div
      layout
      className={clsx(
        'rounded-xl bg-white border border-insurance-dark-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden',
        className
      )}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={clsx(
              'flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white',
              getScoreBgColor(score)
            )}>
              {getInitials(lead.name)}
            </div>
            {/* Online indicator */}
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-insurance-dark-900 truncate">{lead.name}</h3>
                <p className="text-xs text-insurance-dark-400">
                  {lead.age && `${lead.age} yrs`}{lead.gender && ` • ${lead.gender}`}{lead.insuranceType && ` • ${lead.insuranceType}`}
                </p>
              </div>
              {/* Status badge */}
              <span className={clsx(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0',
                status.bg, status.color
              )}>
                <status.icon className="h-3 w-3" />
                {status.label}
              </span>
            </div>

            {/* Contact info */}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-insurance-dark-500">
              <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-insurance-blue-600 transition-colors">
                <Phone className="h-3 w-3" />
                {lead.phone}
              </a>
              <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-insurance-blue-600 transition-colors">
                <Mail className="h-3 w-3" />
                {lead.email}
              </a>
              {lead.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {lead.city}, {lead.state}
                </span>
              )}
            </div>
          </div>

          {/* Score circular progress */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle
                cx="40" cy="40" r="36"
                fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                className={getScoreCircleColor(score)}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={clsx('text-lg font-bold leading-none', getScoreColor(score))}>
                  {score}
                </div>
                <div className="text-[9px] font-medium text-insurance-dark-400 uppercase tracking-wider">Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {lead.aiSummary && (
          <div className="mt-3 rounded-lg bg-insurance-blue-50/50 border border-insurance-blue-100 px-3.5 py-2.5">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-insurance-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-insurance-blue-700 uppercase tracking-wider">AI Summary</p>
                <p className="text-xs text-insurance-dark-600 mt-0.5 leading-relaxed">{lead.aiSummary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Purchase probability */}
        {lead.purchaseProbability !== undefined && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-insurance-dark-500 font-medium">Purchase Probability</span>
                <span className={clsx('font-bold', getScoreColor(lead.purchaseProbability * 100))}>
                  {(lead.purchaseProbability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-insurance-dark-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${lead.purchaseProbability * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={clsx('h-full rounded-full', getScoreColor(lead.purchaseProbability * 100).replace('text-', 'bg-'))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => onAssign?.(lead.id)}
            className="flex items-center gap-1.5 rounded-lg border border-insurance-dark-200 px-3 py-1.5 text-xs font-medium text-insurance-dark-600 hover:bg-insurance-dark-50 hover:border-insurance-dark-300 transition-all"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Assign
          </button>
          <button
            onClick={() => onContact?.(lead.id)}
            className="flex items-center gap-1.5 rounded-lg bg-insurance-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-insurance-blue-600 transition-all"
          >
            <Phone className="h-3.5 w-3.5" />
            Contact
          </button>
          <button
            onClick={() => onConvert?.(lead.id)}
            className="flex items-center gap-1.5 rounded-lg bg-insurance-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-insurance-orange-600 transition-all"
          >
            <Zap className="h-3.5 w-3.5" />
            Convert
          </button>

          {/* Expand */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-insurance-dark-400 hover:text-insurance-dark-600 hover:bg-insurance-dark-50 transition-all"
          >
            {isExpanded ? (
              <>Less <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Details <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-insurance-dark-100"
          >
            <div className="p-5 space-y-4">
              {/* Score breakdown */}
              {lead.score?.breakdown && (
                <div>
                  <h4 className="text-xs font-semibold text-insurance-dark-500 uppercase tracking-wider mb-2.5">Score Breakdown</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {lead.score.breakdown.map((b) => (
                      <div key={b.category} className="rounded-lg bg-insurance-dark-50 px-3 py-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-insurance-dark-500 capitalize">{b.category}</span>
                          <span className="font-semibold text-insurance-dark-800">
                            {b.score}/{b.maxScore}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-insurance-dark-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-insurance-blue-500"
                            style={{ width: `${(b.score / b.maxScore) * 100}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-insurance-dark-400 mt-0.5">Weight: {(b.weight * 100).toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dimension scores */}
              {lead.score && (
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'Intent', value: lead.score.intent, icon: Target },
                    { label: 'Affordability', value: lead.score.affordability, icon: TrendingUp },
                    { label: 'Urgency', value: lead.score.urgency, icon: Clock },
                    { label: 'Trust', value: lead.score.trust, icon: Shield },
                    { label: 'Engagement', value: lead.score.engagement, icon: Activity },
                  ].map((dim) => (
                    <div key={dim.label} className="flex flex-col items-center rounded-lg bg-insurance-dark-50 px-2 py-2.5">
                      <dim.icon className="h-3.5 w-3.5 text-insurance-dark-400 mb-1" />
                      <div className={clsx('text-sm font-bold', getScoreColor(dim.value * 25))}>
                        {(dim.value * 25).toFixed(0)}
                      </div>
                      <div className="text-[9px] text-insurance-dark-400 text-center leading-tight">{dim.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {lead.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-insurance-dark-500 uppercase tracking-wider mb-1">Notes</h4>
                  <p className="text-sm text-insurance-dark-600 bg-insurance-dark-50 rounded-lg p-3">{lead.notes}</p>
                </div>
              )}

              {/* Timeline */}
              <div className="flex items-center gap-4 text-[11px] text-insurance-dark-400 border-t border-insurance-dark-100 pt-3">
                <span>Created: {formatDate(lead.createdAt)}</span>
                {lead.lastActivity && <span>Last Activity: {formatDate(lead.lastActivity)}</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
