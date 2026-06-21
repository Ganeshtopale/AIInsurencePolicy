import { motion } from 'framer-motion'
import {
  Shield,
  Star,
  ChevronRight,
  CheckCircle,
  Building2,
  IndianRupee,
  TrendingUp,
  Heart,
  Activity,
  ShoppingCart,
  Eye,
} from 'lucide-react'
import clsx from 'clsx'

interface PolicyData {
  id: string
  name: string
  provider: string
  providerLogo?: string
  type: string
  description: string
  premium: number
  premiumFrequency?: string
  coverageAmount: number
  claimSettlementRatio: number
  rating: number
  features: string[]
  benefits?: string[]
  discount?: string
  badge?: string
  addOns?: string[]
  tenure?: number
  ageMin?: number
  ageMax?: number
}

interface PolicyCardProps {
  policy: PolicyData
  index?: number
  onViewDetails?: (policyId: string) => void
  onBuyNow?: (policyId: string) => void
  onCompareToggle?: (policyId: string, selected: boolean) => void
  isCompareSelected?: boolean
  className?: string
}

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

function formatPremium(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

function getProviderIcon(provider: string): React.ElementType {
  const p = provider.toLowerCase()
  if (p.includes('hdfc')) return Shield
  if (p.includes('icici')) return Building2
  if (p.includes('bajaj')) return TrendingUp
  if (p.includes('tata')) return Shield
  if (p.includes('sbi')) return Building2
  if (p.includes('star')) return Heart
  return Shield
}

function getProviderColor(provider: string): string {
  const p = provider.toLowerCase()
  if (p.includes('hdfc')) return 'from-insurance-blue-500 to-insurance-blue-700'
  if (p.includes('icici')) return 'from-insurance-red-500 to-insurance-red-700'
  if (p.includes('bajaj')) return 'from-insurance-orange-500 to-insurance-orange-700'
  if (p.includes('tata')) return 'from-insurance-blue-600 to-insurance-blue-800'
  if (p.includes('sbi')) return 'from-insurance-dark-700 to-insurance-dark-900'
  if (p.includes('star')) return 'from-insurance-green-500 to-insurance-green-700'
  return 'from-insurance-blue-500 to-insurance-blue-700'
}

export default function PolicyCard({
  policy,
  index = 0,
  onViewDetails,
  onBuyNow,
  onCompareToggle,
  isCompareSelected = false,
  className,
}: PolicyCardProps) {
  const ProviderIcon = getProviderIcon(policy.provider)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className={clsx(
        'group relative rounded-xl border bg-white transition-all duration-300 overflow-hidden',
        isCompareSelected
          ? 'border-insurance-orange-400 ring-2 ring-insurance-orange-200 shadow-lg'
          : 'border-insurance-dark-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-insurance-orange-200',
        className
      )}
    >
      {/* Badge */}
      {policy.badge && (
        <div className="absolute top-0 right-0 z-10">
          <div className={clsx(
            'relative px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white',
            policy.badge === 'Best Seller' && 'bg-insurance-green-500',
            policy.badge === 'Top Rated' && 'bg-insurance-orange-500',
            policy.badge === 'Budget Pick' && 'bg-insurance-blue-500',
            policy.badge === 'Popular' && 'bg-insurance-red-500'
          )}>
            {policy.badge}
            <div className="absolute bottom-0 right-0 border-l-[8px] border-l-transparent border-b-[8px] border-b-white" />
          </div>
        </div>
      )}

      {/* Discount banner */}
      {policy.discount && (
        <div className="absolute top-0 left-0 z-10 bg-gradient-to-r from-insurance-orange-500 to-insurance-red-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg shadow-sm">
          {policy.discount}
        </div>
      )}

      {/* Compare checkbox */}
      {onCompareToggle && (
        <label className="absolute top-3 right-3 z-10 flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isCompareSelected}
            onChange={(e) => onCompareToggle(policy.id, e.target.checked)}
            className="h-4 w-4 rounded border-insurance-dark-300 text-insurance-orange-500 focus:ring-insurance-orange-400 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-[10px] font-medium text-insurance-dark-400 select-none">Compare</span>
        </label>
      )}

      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-start gap-3.5">
          {/* Provider logo */}
          <div className={clsx(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm overflow-hidden',
            getProviderColor(policy.provider)
          )}>
            {policy.providerLogo ? (
              <img src={policy.providerLogo} alt={policy.provider} className="h-full w-full object-contain p-1" />
            ) : (
              <ProviderIcon className="h-7 w-7" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-insurance-dark-400 uppercase tracking-wider">
                    {policy.provider}
                  </span>
                </div>
                <h3 className="text-base font-bold text-insurance-dark-900 leading-tight mt-0.5">
                  {policy.name}
                </h3>
                <p className="text-xs text-insurance-dark-400 mt-0.5 line-clamp-1">{policy.description}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={clsx(
                      'h-3.5 w-3.5',
                      i < Math.floor(policy.rating)
                        ? 'fill-insurance-orange-400 text-insurance-orange-400'
                        : 'text-insurance-dark-200'
                    )}
                  />
                ))}
                <span className="ml-1 text-xs font-semibold text-insurance-dark-700">{policy.rating.toFixed(1)}</span>
              </div>
              <span className="text-[11px] text-insurance-dark-400 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Claim Ratio: {policy.claimSettlementRatio}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-insurance-dark-100" />

      {/* Pricing */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] font-medium text-insurance-dark-400 uppercase tracking-wider">Premium</span>
            <div className="mt-0.5 flex items-baseline gap-1">
              <IndianRupee className="h-4 w-4 text-insurance-dark-400" />
              <span className="text-xl font-bold text-insurance-dark-900">{formatPremium(policy.premium)}</span>
              <span className="text-xs text-insurance-dark-400">/{policy.premiumFrequency || 'year'}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium text-insurance-dark-400 uppercase tracking-wider">Coverage</span>
            <div className="mt-0.5 flex items-baseline justify-end gap-1">
              <IndianRupee className="h-4 w-4 text-insurance-green-500" />
              <span className="text-xl font-bold text-insurance-green-600">{formatCurrency(policy.coverageAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-insurance-dark-100" />

      {/* Features */}
      <div className="px-5 py-4">
        <span className="text-[11px] font-medium text-insurance-dark-400 uppercase tracking-wider mb-2 block">Key Features</span>
        <div className="space-y-1.5">
          {policy.features.slice(0, 4).map((feat) => (
            <div key={feat} className="flex items-start gap-2 text-xs text-insurance-dark-600">
              <CheckCircle className="h-3.5 w-3.5 text-insurance-green-500 mt-0.5 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
          {policy.features.length > 4 && (
            <button
              onClick={() => onViewDetails?.(policy.id)}
              className="flex items-center gap-1 text-xs font-medium text-insurance-blue-600 hover:text-insurance-blue-700 transition-colors ml-5 mt-1"
            >
              +{policy.features.length - 4} more features
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Add-ons */}
      {policy.addOns && policy.addOns.length > 0 && (
        <>
          <div className="border-t border-insurance-dark-100" />
          <div className="px-5 py-3">
            <div className="flex flex-wrap gap-1.5">
              {policy.addOns.map((addon) => (
                <span
                  key={addon}
                  className="inline-flex items-center gap-0.5 rounded-full bg-insurance-blue-50 px-2 py-0.5 text-[10px] font-medium text-insurance-blue-600"
                >
                  <CheckCircle className="h-2.5 w-2.5" />
                  {addon}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CTA */}
      <div className="border-t border-insurance-dark-100 bg-insurance-dark-50/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onBuyNow?.(policy.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-insurance-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-insurance-orange-600 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <ShoppingCart className="h-4 w-4" />
            Buy Now
          </button>
          <button
            onClick={() => onViewDetails?.(policy.id)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-insurance-dark-200 px-4 py-2.5 text-sm font-medium text-insurance-dark-600 hover:bg-white hover:border-insurance-blue-300 hover:text-insurance-blue-600 transition-all"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">View Details</span>
          </button>
        </div>
      </div>

      {/* Hover bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-insurance-orange-500 to-insurance-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </motion.div>
  )
}
