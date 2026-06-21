import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Heart,
  TrendingUp,
  Car,
  Bike,
  Plane,
  Star,
  Search,
  SlidersHorizontal,
  CheckCircle,
  X,
  Clock,
  Users as UsersIcon,
  Building2,
  Zap,
  BarChart3,
} from 'lucide-react';
import clsx from 'clsx';
import { policyApi } from '@/services/api';

type Policy = {
  id: string;
  name: string;
  provider: string;
  providerLogo?: string;
  type: 'term' | 'health' | 'investment' | 'car' | 'bike' | 'travel';
  premium: number;
  premiumLabel: string;
  premiumAnnual: string;
  coverage: string;
  claimRatio: string;
  rating: number;
  reviews: number;
  features: string[];
  benefits: string[];
  eligibility: string;
  maxAge: number;
  discount?: string;
  badge?: string;
};

const policyTypes = [
  { value: '', label: 'All Types', icon: BarChart3 },
  { value: 'term', label: 'Term Life', icon: Shield },
  { value: 'health', label: 'Health', icon: Heart },
  { value: 'investment', label: 'Investment', icon: TrendingUp },
  { value: 'car', label: 'Car', icon: Car },
  { value: 'bike', label: '2 Wheeler', icon: Bike },
  { value: 'travel', label: 'Travel', icon: Plane },
];

const premiumRanges = [
  { value: '', label: 'Any Budget' },
  { value: '0-500', label: 'Under ₹500/mo' },
  { value: '500-1500', label: '₹500 - ₹1,500/mo' },
  { value: '1500-3000', label: '₹1,500 - ₹3,000/mo' },
  { value: '3000+', label: 'Above ₹3,000/mo' },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'term': return Shield;
    case 'health': return Heart;
    case 'investment': return TrendingUp;
    case 'car': return Car;
    case 'bike': return Bike;
    case 'travel': return Plane;
    default: return Shield;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'term': return 'from-blue-500 to-blue-600';
    case 'health': return 'from-orange-400 to-orange-600';
    case 'investment': return 'from-green-500 to-green-600';
    case 'car': return 'from-purple-500 to-purple-600';
    case 'bike': return 'from-red-500 to-red-600';
    case 'travel': return 'from-teal-500 to-teal-600';
    default: return 'from-gray-500 to-gray-600';
  }
};

function mapApiPolicy(p: any): Policy {
  return {
    id: p.id,
    name: p.name,
    provider: p.provider_name || p.provider,
    providerLogo: p.provider_logo,
    type: (p.policy_type || p.type || 'term') as Policy['type'],
    premium: p.premium,
    premiumLabel: `₹${p.premium.toLocaleString()}/mo`,
    premiumAnnual: `₹${(p.premium * 12).toLocaleString()}/yr`,
    coverage: p.coverage_amount ? `₹${(p.coverage_amount / 100000).toFixed(p.coverage_amount >= 10000000 ? 0 : 1)}${p.coverage_amount >= 10000000 ? 'Cr' : 'L'}` : '—',
    claimRatio: p.claim_settlement_ratio ? `${p.claim_settlement_ratio}%` : '—',
    rating: p.rating || 0,
    reviews: 0,
    features: p.features || [],
    benefits: p.benefits || [],
    eligibility: 'All ages',
    maxAge: 0,
  };
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="mt-1 h-3 w-20 rounded bg-gray-100" />
            </div>
          </div>
          <div className="mt-4 h-8 w-24 rounded bg-gray-200" />
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-2.5">
            <div className="h-8 rounded bg-gray-200" />
            <div className="h-8 rounded bg-gray-200" />
            <div className="h-8 rounded bg-gray-200" />
          </div>
          <div className="mt-3 space-y-1">
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-3/4 rounded bg-gray-100" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-9 flex-1 rounded-lg bg-gray-200" />
            <div className="h-9 flex-1 rounded-lg bg-gray-200" />
            <div className="h-9 w-10 rounded-lg bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedPremium, setSelectedPremium] = useState('');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [detailPolicy, setDetailPolicy] = useState<Policy | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'premium' | 'claim'>('rating');

  useEffect(() => {
    let cancelled = false;
    const fetchPolicies = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await policyApi.getPolicies({});
        if (!cancelled) {
          const mapped = (data || []).map(mapApiPolicy);
          setPolicies(mapped);
          if (mapped.length === 0) setError('No policies available yet.');
        }
      } catch {
        if (!cancelled) setError('Could not load policies from server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPolicies();
    return () => { cancelled = true; };
  }, []);

  const providers = [...new Set(policies.map((p) => p.provider))];

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : prev.length < 4 ? [...prev, id] : prev,
    );
  };

  const filteredPolicies = policies.filter((p) => {
    if (selectedType && p.type !== selectedType) return false;
    if (selectedProvider && p.provider !== selectedProvider) return false;
    if (selectedPremium) {
      const [min, max] = selectedPremium.split('-').map(Number);
      if (max) { if (p.premium < min || p.premium > max) return false; }
      else if (p.premium < min) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'premium') return a.premium - b.premium;
    if (sortBy === 'claim') return parseFloat(b.claimRatio) - parseFloat(a.claimRatio);
    return 0;
  });

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Policy Type</h4>
        <div className="space-y-1">
          {policyTypes.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={clsx(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                  selectedType === t.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Provider</h4>
        <div className="space-y-1">
          {providers.map((pr) => (
            <button
              key={pr}
              onClick={() => setSelectedProvider(selectedProvider === pr ? '' : pr)}
              className={clsx(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                selectedProvider === pr ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              <Building2 className="h-4 w-4" /> {pr}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Monthly Premium Range</h4>
        <div className="space-y-1">
          {premiumRanges.map((r) => (
            <button
              key={r.value}
              onClick={() => setSelectedPremium(r.value)}
              className={clsx(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                selectedPremium === r.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              <span className="text-xs">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Sort By</h4>
        <div className="space-y-1">
          {[
            { value: 'rating', label: 'Highest Rated' },
            { value: 'premium', label: 'Lowest Premium' },
            { value: 'claim', label: 'Claim Ratio' },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => setSortBy(s.value as typeof sortBy)}
              className={clsx(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                sortBy === s.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => { setSelectedType(''); setSelectedProvider(''); setSelectedPremium(''); setSortBy('rating'); }}
        className="w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Insurance Plans</h1>
            <p className="mt-1 text-sm text-gray-500">{loading ? 'Loading plans...' : `Compare and choose from ${policies.length}+ plans from top insurers`}</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedForCompare.length >= 2 && (
              <a
                href={`/compare?policies=${selectedForCompare.join(',')}`}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <BarChart3 className="h-4 w-4" /> Compare ({selectedForCompare.length})
              </a>
            )}
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 border border-yellow-200">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-8 rounded-xl bg-white p-5 shadow-sm">
              <FilterSidebar />
            </div>
          </aside>

          <AnimatePresence>
            {showMobileFilter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 lg:hidden"
                onClick={() => setShowMobileFilter(false)}
              >
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-white p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900">Filters</h3>
                    <button onClick={() => setShowMobileFilter(false)} className="p-1 text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <FilterSidebar />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Search policies by name, provider..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-900">{filteredPolicies.length}</span> plans
                  </p>
                  <div className="hidden items-center gap-1 text-xs text-gray-400 sm:flex">
                    <CheckCircle className="h-3 w-3 text-green-500" /> All plans are IRDAI approved
                  </div>
                </div>

                <motion.div
                  initial="initial"
                  animate="animate"
                  className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                  variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
                >
                  {filteredPolicies.map((policy) => {
                    const Icon = getTypeIcon(policy.type);
                    const isCompared = selectedForCompare.includes(policy.id);
                    return (
                      <motion.div
                        key={policy.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx(
                          'group relative rounded-xl bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
                          isCompared && 'ring-2 ring-blue-500',
                        )}
                      >
                        <div className="absolute right-3 top-3 flex items-center gap-1.5">
                          {policy.badge && (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">{policy.badge}</span>
                          )}
                          {policy.discount && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">{policy.discount}</span>
                          )}
                        </div>

                        <div className="flex items-start gap-3">
                          <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white', getTypeColor(policy.type))}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{policy.name}</h3>
                            <p className="text-xs text-gray-500">{policy.provider}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-gray-900">{policy.premiumLabel}</span>
                          {policy.type !== 'car' && policy.type !== 'bike' && <span className="text-xs text-gray-400">/mo</span>}
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-2.5 text-center text-xs">
                          <div>
                            <p className="font-semibold text-gray-900">{policy.coverage}</p>
                            <p className="text-gray-400">Coverage</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{policy.claimRatio}</p>
                            <p className="text-gray-400">Claim Ratio</p>
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-0.5">
                              <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                              <span className="font-semibold text-gray-900">{policy.rating}</span>
                            </div>
                            <p className="text-gray-400">{policy.reviews.toLocaleString()} reviews</p>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1">
                          {policy.features.slice(0, 3).map((f) => (
                            <div key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
                              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                              {f}
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() => setDetailPolicy(policy)}
                            className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                          >
                            Details
                          </button>
                          <a
                            href={`/checkout?policy=${policy.id}`}
                            className="flex-1 rounded-lg bg-orange-500 py-2 text-center text-xs font-semibold text-white transition hover:bg-orange-600"
                          >
                            Buy Now
                          </a>
                          <button
                            onClick={() => toggleCompare(policy.id)}
                            className={clsx(
                              'flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-medium transition',
                              isCompared
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300',
                            )}
                          >
                            <BarChart3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {filteredPolicies.length === 0 && (
                  <div className="flex flex-col items-center py-20 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-200" />
                    <h3 className="mt-4 text-lg font-medium text-gray-500">No policies match your filters</h3>
                    <button
                      onClick={() => { setSelectedType(''); setSelectedProvider(''); setSelectedPremium(''); }}
                      className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {detailPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setDetailPolicy(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white', getTypeColor(detailPolicy.type))}>
                    {React.createElement(getTypeIcon(detailPolicy.type), { className: 'h-6 w-6' })}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{detailPolicy.name}</h3>
                    <p className="text-sm text-gray-500">{detailPolicy.provider}</p>
                  </div>
                </div>
                <button onClick={() => setDetailPolicy(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-blue-500">Monthly Premium</p>
                  <p className="text-lg font-bold text-gray-900">{detailPolicy.premiumLabel}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-xs text-green-500">Coverage Amount</p>
                  <p className="text-lg font-bold text-gray-900">{detailPolicy.coverage}</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-3">
                  <p className="text-xs text-orange-500">Claim Ratio</p>
                  <p className="text-lg font-bold text-gray-900">{detailPolicy.claimRatio}</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3">
                  <p className="text-xs text-purple-500">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                    <span className="text-lg font-bold text-gray-900">{detailPolicy.rating}</span>
                    <span className="text-xs text-gray-400">({detailPolicy.reviews.toLocaleString()})</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-900">Key Features</h4>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {detailPolicy.features.map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-sm text-gray-600">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> {f}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-900">Benefits</h4>
                <div className="mt-2 space-y-1">
                  {detailPolicy.benefits.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-sm text-gray-600">
                      <Zap className="mt-0.5 h-3.5 w-3.5 text-orange-400 shrink-0" /> {b}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 rounded-lg bg-gray-50 p-3 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <UsersIcon className="h-4 w-4 text-gray-400" /> {detailPolicy.eligibility}
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" /> Max entry: {detailPolicy.maxAge} years
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <a
                  href={`/checkout?policy=${detailPolicy.id}`}
                  className="flex-1 rounded-lg bg-orange-500 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
                >
                  Buy Now
                </a>
                <a
                  href={`/compare?policy=${detailPolicy.id}`}
                  className="flex-1 rounded-lg border border-blue-200 py-3 text-center font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Compare Plans
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
