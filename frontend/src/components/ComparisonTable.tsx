import { useState } from 'react'
import {
  CheckCircle,
  ShoppingCart,
  Star,
  TrendingUp,
  Clock,
  Shield,
  Activity,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react'
import clsx from 'clsx'

interface PolicyComparison {
  id: string
  name: string
  provider: string
  providerLogo?: string
  premium: string
  coverage: string
  claimRatio: string
  waitingPeriod: string
  addOns: string[]
  rating: number
  isBestValue?: boolean
  features: string[]
  badge?: string
}

interface ComparisonTableProps {
  policies: PolicyComparison[]
  onBuyNow?: (policyId: string) => void
  onCompare?: (policyIds: string[]) => void
  className?: string
}

const samplePolicies: PolicyComparison[] = [
  {
    id: 'p1',
    name: 'Health Shield Plus',
    provider: 'HDFC Ergo',
    premium: '₹12,500/yr',
    coverage: '₹10 Lakhs',
    claimRatio: '94.5%',
    waitingPeriod: '30 days',
    addOns: ['Zero Depreciation', 'Room Rent Waiver', 'Maternity Cover'],
    rating: 4.5,
    isBestValue: true,
    features: ['Cashless hospitalization', '10,000+ network hospitals', 'Pre & post hospitalization', 'Day care procedures'],
    badge: 'Best Value',
  },
  {
    id: 'p2',
    name: 'Comprehensive Care',
    provider: 'ICICI Lombard',
    premium: '₹14,800/yr',
    coverage: '₹15 Lakhs',
    claimRatio: '92.1%',
    waitingPeriod: '60 days',
    addOns: ['Zero Depreciation', 'Critical Illness', 'Hospital Cash'],
    rating: 4.3,
    features: ['Cashless hospitalization', '8,000+ network hospitals', 'Annual health checkup', 'Ambulance cover'],
  },
  {
    id: 'p3',
    name: 'Family Floater Plan',
    provider: 'Bajaj Allianz',
    premium: '₹9,800/yr',
    coverage: '₹5 Lakhs',
    claimRatio: '89.8%',
    waitingPeriod: '90 days',
    addOns: ['Maternity Cover', 'Newborn Cover'],
    rating: 4.1,
    features: ['Family floater up to 4 members', '6,000+ network hospitals', 'No claim bonus', 'Tax benefits'],
    badge: 'Budget Pick',
  },
  {
    id: 'p4',
    name: 'Senior Secure Plan',
    provider: 'Star Health',
    premium: '₹21,500/yr',
    coverage: '₹20 Lakhs',
    claimRatio: '96.2%',
    waitingPeriod: '0 days',
    addOns: ['Critical Illness', 'Hospital Cash', 'OPD Cover', 'Dental Cover'],
    rating: 4.7,
    isBestValue: true,
    features: ['No upper age limit', 'Senior citizen special', 'Domiciliary cover', 'Pre-existing disease cover from day 1'],
    badge: 'Top Rated',
  },
]

export default function ComparisonTable({
  policies = samplePolicies,
  onBuyNow,
  onCompare,
  className,
}: ComparisonTableProps) {
  const [selected, setSelected] = useState<string[]>([policies[0]?.id || ''])
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  const togglePolicy = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const bestValueIds = policies.filter((p) => p.isBestValue).map((p) => p.id)

  return (
    <div className={clsx('w-full', className)}>
      {/* Selection controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-insurance-dark-600">Select policies to compare:</span>
        {policies.map((p) => (
          <button
            key={p.id}
            onClick={() => togglePolicy(p.id)}
            className={clsx(
              'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all',
              selected.includes(p.id)
                ? 'bg-insurance-orange-50 border-insurance-orange-300 text-insurance-orange-600'
                : 'bg-white border-insurance-dark-200 text-insurance-dark-500 hover:border-insurance-dark-300'
            )}
          >
            <span className={clsx(
              'flex h-4 w-4 items-center justify-center rounded border',
              selected.includes(p.id)
                ? 'bg-insurance-orange-500 border-insurance-orange-500 text-white'
                : 'border-insurance-dark-300'
            )}>
              {selected.includes(p.id) && <CheckCircle className="h-3 w-3" />}
            </span>
            {p.provider} - {p.name}
          </button>
        ))}
        {onCompare && selected.length > 0 && (
          <button
            onClick={() => onCompare(selected)}
            className="ml-2 rounded-lg bg-insurance-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-insurance-blue-600 transition-colors"
          >
            Compare ({selected.length})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-insurance-dark-100 bg-white shadow-sm">
        <table className="w-full min-w-[700px]">
          {/* Table header */}
          <thead>
            <tr className="bg-insurance-dark-50">
              <th className="sticky left-0 bg-insurance-dark-50 z-10 px-4 py-3.5 text-left text-xs font-semibold text-insurance-dark-500 uppercase tracking-wider w-40">
                Features
              </th>
              {policies.map((p, idx) => (
                <th
                  key={p.id}
                  className={clsx(
                    'px-4 py-3.5 text-center',
                    bestValueIds.includes(p.id) && 'bg-insurance-orange-50/50',
                    idx === policies.length - 1 && 'pr-6'
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    {p.badge && (
                      <span className={clsx(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                        p.badge === 'Best Value' && 'bg-insurance-green-100 text-insurance-green-700',
                        p.badge === 'Top Rated' && 'bg-insurance-orange-100 text-insurance-orange-700',
                        p.badge === 'Budget Pick' && 'bg-insurance-blue-100 text-insurance-blue-700'
                      )}>
                        {p.badge}
                      </span>
                    )}
                    {p.providerLogo && <img src={p.providerLogo} alt="" className="h-6 mb-1" />}
                    <div className="text-sm font-bold text-insurance-dark-900">{p.provider}</div>
                    <div className="text-[11px] text-insurance-dark-500">{p.name}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="divide-y divide-insurance-dark-100">
            {/* Premium */}
            <tr className="group hover:bg-insurance-dark-50/50 transition-colors">
              <td className="sticky left-0 bg-white group-hover:bg-insurance-dark-50/50 z-10 px-4 py-3 text-sm font-medium text-insurance-dark-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-insurance-dark-400 shrink-0" />
                <span>Premium (Annual)</span>
              </td>
              {policies.map((p, idx) => (
                <td
                  key={p.id}
                  className={clsx(
                    'px-4 py-3 text-center text-sm font-bold text-insurance-dark-900',
                    bestValueIds.includes(p.id) && 'bg-insurance-orange-50/30',
                    idx === policies.length - 1 && 'pr-6'
                  )}
                >
                  {p.premium}
                </td>
              ))}
            </tr>

            {/* Coverage */}
            <tr className="group hover:bg-insurance-dark-50/50 transition-colors">
              <td className="sticky left-0 bg-white group-hover:bg-insurance-dark-50/50 z-10 px-4 py-3 text-sm font-medium text-insurance-dark-700 flex items-center gap-2">
                <Shield className="h-4 w-4 text-insurance-dark-400 shrink-0" />
                <span>Coverage Amount</span>
              </td>
              {policies.map((p, idx) => (
                <td
                  key={p.id}
                  className={clsx(
                    'px-4 py-3 text-center text-sm font-semibold text-insurance-dark-900',
                    bestValueIds.includes(p.id) && 'bg-insurance-orange-50/30',
                    idx === policies.length - 1 && 'pr-6'
                  )}
                >
                  {p.coverage}
                </td>
              ))}
            </tr>

            {/* Claim Ratio */}
            <tr className="group hover:bg-insurance-dark-50/50 transition-colors">
              <td className="sticky left-0 bg-white group-hover:bg-insurance-dark-50/50 z-10 px-4 py-3 text-sm font-medium text-insurance-dark-700 flex items-center gap-2">
                <Activity className="h-4 w-4 text-insurance-dark-400 shrink-0" />
                <span>Claim Settlement Ratio</span>
              </td>
              {policies.map((p, idx) => (
                <td
                  key={p.id}
                  className={clsx(
                    'px-4 py-3 text-center',
                    bestValueIds.includes(p.id) && 'bg-insurance-orange-50/30',
                    idx === policies.length - 1 && 'pr-6'
                  )}
                >
                  <span className="inline-flex items-center gap-1 font-semibold text-insurance-dark-900">
                    {p.claimRatio}
                    {parseFloat(p.claimRatio) >= 94 && (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    )}
                  </span>
                </td>
              ))}
            </tr>

            {/* Waiting Period */}
            <tr className="group hover:bg-insurance-dark-50/50 transition-colors">
              <td className="sticky left-0 bg-white group-hover:bg-insurance-dark-50/50 z-10 px-4 py-3 text-sm font-medium text-insurance-dark-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-insurance-dark-400 shrink-0" />
                <span>Waiting Period</span>
              </td>
              {policies.map((p, idx) => (
                <td
                  key={p.id}
                  className={clsx(
                    'px-4 py-3 text-center text-sm text-insurance-dark-700',
                    bestValueIds.includes(p.id) && 'bg-insurance-orange-50/30',
                    idx === policies.length - 1 && 'pr-6'
                  )}
                >
                  {p.waitingPeriod}
                </td>
              ))}
            </tr>

            {/* Add-ons */}
            <tr className="group hover:bg-insurance-dark-50/50 transition-colors">
              <td className="sticky left-0 bg-white group-hover:bg-insurance-dark-50/50 z-10 px-4 py-3 text-sm font-medium text-insurance-dark-700 flex items-center gap-2">
                <Star className="h-4 w-4 text-insurance-dark-400 shrink-0" />
                <span>Add-ons / Riders</span>
              </td>
              {policies.map((p, idx) => (
                <td
                  key={p.id}
                  className={clsx(
                    'px-4 py-3 text-center',
                    bestValueIds.includes(p.id) && 'bg-insurance-orange-50/30',
                    idx === policies.length - 1 && 'pr-6'
                  )}
                >
                  <div className="flex flex-wrap justify-center gap-1">
                    {p.addOns.slice(0, 3).map((addon) => (
                      <span
                        key={addon}
                        className="inline-flex items-center gap-0.5 rounded-full bg-insurance-blue-50 px-2 py-0.5 text-[10px] font-medium text-insurance-blue-600"
                      >
                        <CheckCircle className="h-2.5 w-2.5" />
                        {addon}
                      </span>
                    ))}
                    {p.addOns.length > 3 && (
                      <span className="text-[10px] text-insurance-dark-400">
                        +{p.addOns.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr className="group hover:bg-insurance-dark-50/50 transition-colors">
              <td className="sticky left-0 bg-white group-hover:bg-insurance-dark-50/50 z-10 px-4 py-3 text-sm font-medium text-insurance-dark-700 flex items-center gap-2">
                <Star className="h-4 w-4 text-insurance-orange-400 shrink-0" />
                <span>Rating</span>
              </td>
              {policies.map((p, idx) => (
                <td
                  key={p.id}
                  className={clsx(
                    'px-4 py-3 text-center',
                    bestValueIds.includes(p.id) && 'bg-insurance-orange-50/30',
                    idx === policies.length - 1 && 'pr-6'
                  )}
                >
                  <div className="flex items-center justify-center gap-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={clsx(
                            'h-3.5 w-3.5',
                            i < Math.floor(p.rating)
                              ? 'fill-insurance-orange-400 text-insurance-orange-400'
                              : 'text-insurance-dark-200'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-insurance-dark-800">{p.rating.toFixed(1)}</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Features */}
            <tr className="group hover:bg-insurance-dark-50/50 transition-colors">
              <td className="sticky left-0 bg-white group-hover:bg-insurance-dark-50/50 z-10 px-4 py-3 text-sm font-medium text-insurance-dark-700 flex items-center gap-2">
                <Info className="h-4 w-4 text-insurance-dark-400 shrink-0" />
                <span>Key Features</span>
              </td>
              {policies.map((p, idx) => (
                <td
                  key={p.id}
                  className={clsx(
                    'px-4 py-3 text-center',
                    bestValueIds.includes(p.id) && 'bg-insurance-orange-50/30',
                    idx === policies.length - 1 && 'pr-6'
                  )}
                >
                  <ul className="space-y-1 text-left">
                    {(showAllFeatures ? p.features : p.features.slice(0, 3)).map((feat) => (
                      <li key={feat} className="flex items-start gap-1.5 text-xs text-insurance-dark-600">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        {feat}
                      </li>
                    ))}
                    {p.features.length > 3 && !showAllFeatures && (
                      <li className="text-[11px] text-insurance-dark-400 ml-5">
                        +{p.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </td>
              ))}
            </tr>

            {/* CTA row */}
            <tr className="bg-insurance-dark-50/50">
              <td className="sticky left-0 bg-insurance-dark-50/50 z-10 px-4 py-4" />
              {policies.map((p, idx) => (
                <td
                  key={p.id}
                  className={clsx(
                    'px-4 py-4 text-center',
                    bestValueIds.includes(p.id) && 'bg-insurance-orange-50/30',
                    idx === policies.length - 1 && 'pr-6'
                  )}
                >
                  <button
                    onClick={() => onBuyNow?.(p.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-insurance-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-insurance-orange-600 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Buy Now
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Show all features toggle */}
      <button
        onClick={() => setShowAllFeatures(!showAllFeatures)}
        className="mt-3 flex items-center gap-1 text-xs font-medium text-insurance-blue-600 hover:text-insurance-blue-700 transition-colors"
      >
        {showAllFeatures ? (
          <>Show less <ChevronUp className="h-3.5 w-3.5" /></>
        ) : (
          <>Show all features <ChevronDown className="h-3.5 w-3.5" /></>
        )}
      </button>
    </div>
  )
}
