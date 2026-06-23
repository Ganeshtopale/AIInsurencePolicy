import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Heart,
  TrendingUp,
  Car,
  Star,
  CheckCircle,
  XCircle,
  ArrowRight,
  Filter,
  Info,
  ChevronDown,
  BarChart3,
  Award,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { policyApi } from '@/services/api';

type Policy = {
  id: string;
  name: string;
  provider: string;
  providerLogo?: string;
  type: 'term' | 'health' | 'investment' | 'car';
  premium: number;
  premiumLabel: string;
  coverage: string;
  claimRatio: string;
  waitingPeriod: string;
  addons: string[];
  rating: number;
  reviews: number;
  features: string[];
  bestFor: string;
};

const policyTypes = [
  { value: '', label: 'All Types' },
  { value: 'term', label: 'Term Life' },
  { value: 'health', label: 'Health' },
  { value: 'investment', label: 'Investment' },
  { value: 'car', label: 'Car' },
];

const budgetRanges = [
  { value: '', label: 'Any Budget' },
  { value: '0-500', label: 'Under ₹500/mo' },
  { value: '500-1000', label: '₹500 - ₹1,000/mo' },
  { value: '1000-2000', label: '₹1,000 - ₹2,000/mo' },
  { value: '2000+', label: 'Above ₹2,000/mo' },
];

function mapApiPolicy(p: any): Policy {
  const type = p.policy_type || p.type || 'term';
  return {
    id: p.id,
    name: p.name,
    provider: p.provider_name || p.provider,
    providerLogo: p.provider_logo,
    type: (type === 'bike' || type === 'travel') ? 'car' : (type as Policy['type']),
    premium: p.premium,
    premiumLabel: `₹${p.premium.toLocaleString()}/month`,
    coverage: p.coverage_amount ? `₹${(p.coverage_amount / 100000).toFixed(p.coverage_amount >= 10000000 ? 0 : 1)}${p.coverage_amount >= 10000000 ? 'Cr' : 'L'}` : '—',
    claimRatio: p.claim_settlement_ratio ? `${p.claim_settlement_ratio}%` : '—',
    waitingPeriod: p.waiting_period ? `${p.waiting_period} days` : 'None',
    addons: (p.features || []).slice(0, 3).map((f: any) => typeof f === 'string' ? f : f.name || f.title || JSON.stringify(f)),
    rating: p.rating || 0,
    reviews: 0,
    features: (p.features || []).map((f: any) => typeof f === 'string' ? f : f.name || f.title || JSON.stringify(f)),
    bestFor: 'Popular',
  };
}

export default function Compare() {
  const [allPolicies, setAllPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [hoveredPolicy, setHoveredPolicy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchPolicies = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await policyApi.getPolicies({});
        if (!cancelled && data.length > 0) {
          const mapped = data.map(mapApiPolicy);
          setAllPolicies(mapped);
          setSelectedPolicies(mapped.length >= 2 ? [mapped[0].id, mapped[1].id] : []);
        } else if (!cancelled) {
          setError('No policies available. Ask an admin to add policies.');
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

  const togglePolicy = (id: string) => {
    if (selectedPolicies.includes(id)) {
      if (selectedPolicies.length > 2) {
        setSelectedPolicies((prev) => prev.filter((p) => p !== id));
      }
    } else {
      if (selectedPolicies.length < 4) {
        setSelectedPolicies((prev) => [...prev, id]);
      }
    }
  };

  const filteredPolicies = allPolicies.filter((p) => {
    if (selectedType && p.type !== selectedType) return false;
    if (selectedBudget) {
      const [min, max] = selectedBudget.split('-').map(Number);
      if (max) {
        if (p.premium < min || p.premium > max) return false;
      } else if (p.premium < min) return false;
    }
    return true;
  });

  const comparedPolicies = allPolicies.filter((p) => selectedPolicies.includes(p.id));
  const bestValuePolicy = comparedPolicies.reduce((best, p) => (p.rating > best.rating ? p : best), comparedPolicies[0]);

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
      case 'term': return 'from-blue-500 to-blue-600';
      case 'health': return 'from-orange-400 to-orange-600';
      case 'investment': return 'from-green-500 to-green-600';
      case 'car': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Compare Insurance Plans</h1>
              <p className="mt-1 text-sm text-gray-500">{loading ? 'Loading plans...' : 'Select up to 4 policies to compare side by side'}</p>
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" /> Filters <ChevronDown className={clsx('h-3 w-3 transition', showFilter && 'rotate-180')} />
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 border border-yellow-200">
              {error}
            </div>
          )}

          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Policy Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      {policyTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Budget</label>
                    <select
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      {budgetRanges.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => { setSelectedType(''); setSelectedBudget(''); }}
                      className="rounded-lg px-4 py-2 text-sm text-blue-600 transition hover:bg-blue-50"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Compare:</span>
          {filteredPolicies.slice(0, 8).map((p) => {
            const isSelected = selectedPolicies.includes(p.id);
            const Icon = getTypeIcon(p.type);
            return (
              <button
                key={p.id}
                onClick={() => togglePolicy(p.id)}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition',
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300',
                  selectedPolicies.length >= 4 && !isSelected && 'opacity-50 cursor-not-allowed',
                )}
                disabled={selectedPolicies.length >= 4 && !isSelected}
              >
                <Icon className="h-3 w-3" />
                {p.provider}
                {isSelected && <XCircle className="h-3 w-3" onClick={(e) => { e.stopPropagation(); togglePolicy(p.id); }} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-400">Loading policies...</p>
          </div>
        ) : comparedPolicies.length < 2 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-sm">
            <BarChart3 className="h-16 w-16 text-gray-200" />
            <h3 className="mt-4 text-lg font-semibold text-gray-500">Select at least 2 policies to compare</h3>
            <p className="mt-2 text-sm text-gray-400">Click on policies above to add them to the comparison</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl bg-white shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="sticky left-0 z-10 min-w-[140px] bg-white px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Features
                    </th>
                    {comparedPolicies.map((p) => {
                      const Icon = getTypeIcon(p.type);
                      return (
                        <th key={p.id} className={clsx('min-w-[200px] px-4 py-4 text-left', hoveredPolicy === p.id && 'bg-blue-50/50')}
                          onMouseEnter={() => setHoveredPolicy(p.id)}
                          onMouseLeave={() => setHoveredPolicy(null)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={clsx('flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white', getTypeColor(p.type))}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-900">{p.provider}</span>
                                {p.id === bestValuePolicy.id && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                                    <Award className="h-3 w-3" /> Best
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">{p.name}</span>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                    {comparedPolicies.length < 4 && (
                      <th className="min-w-[200px] px-4 py-4 text-center">
                        <div className="rounded-lg border-2 border-dashed border-gray-200 py-8">
                          <p className="text-xs text-gray-400">Add more policies</p>
                          <p className="text-[10px] text-gray-300">Select from above</p>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xs font-medium text-gray-500">Monthly Premium</td>
                    {comparedPolicies.map((p) => {
                      const min = Math.min(...comparedPolicies.map((x) => x.premium));
                      return (
                        <td key={p.id} className={clsx('px-4 py-3', hoveredPolicy === p.id && 'bg-blue-50/30')}>
                          <span className={clsx('text-sm font-bold', p.premium === min ? 'text-green-600' : 'text-gray-900')}>
                            {p.premiumLabel}
                          </span>
                          {p.premium === min && <span className="ml-1.5 text-[10px] font-medium text-green-600">Lowest</span>}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="border-b border-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xs font-medium text-gray-500">Coverage Amount</td>
                    {comparedPolicies.map((p) => (
                      <td key={p.id} className="px-4 py-3">
                        <span className="font-semibold text-gray-900">{p.coverage}</span>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xs font-medium text-gray-500">Claim Settlement Ratio</td>
                    {comparedPolicies.map((p) => {
                      const max = Math.max(...comparedPolicies.map((x) => parseFloat(x.claimRatio)));
                      return (
                        <td key={p.id} className="px-4 py-3">
                          <span className={clsx('font-semibold', parseFloat(p.claimRatio) === max ? 'text-green-600' : 'text-gray-900')}>
                            {p.claimRatio}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="border-b border-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xs font-medium text-gray-500">Waiting Period</td>
                    {comparedPolicies.map((p) => (
                      <td key={p.id} className="px-4 py-3">
                        <span className="text-gray-900">{p.waitingPeriod || 'None'}</span>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xs font-medium text-gray-500">Customer Rating</td>
                    {comparedPolicies.map((p) => {
                      const max = Math.max(...comparedPolicies.map((x) => x.rating));
                      return (
                        <td key={p.id} className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Star className={clsx('h-4 w-4', p.rating === max ? 'fill-orange-400 text-orange-400' : 'fill-gray-300 text-gray-300')} />
                            <span className={clsx('font-semibold', p.rating === max ? 'text-orange-600' : 'text-gray-900')}>{p.rating}</span>
                            <span className="text-xs text-gray-400">({p.reviews.toLocaleString()})</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="border-b border-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xs font-medium text-gray-500">Add-ons</td>
                    {comparedPolicies.map((p) => (
                      <td key={p.id} className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.addons.map((a) => (
                            <span key={a} className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">{a}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xs font-medium text-gray-500">Features</td>
                    {comparedPolicies.map((p) => (
                      <td key={p.id} className="px-4 py-3">
                        <div className="space-y-1.5">
                          {p.features.map((f) => (
                            <div key={f} className="flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-xs text-gray-600">{f}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xs font-medium text-gray-500">Best For</td>
                    {comparedPolicies.map((p) => (
                      <td key={p.id} className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                          <Zap className="h-3 w-3" /> {p.bestFor}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-gray-50">
                    <td className="sticky left-0 z-10 bg-gray-50 px-4 py-4 text-xs font-semibold text-gray-700">Overall Score</td>
                    {comparedPolicies.map((p) => {
                      const score = (p.rating * 20 * 0.4) + (parseFloat(p.claimRatio) * 0.3) + ((1000 / p.premium) * 0.3);
                      const maxScore = Math.max(...comparedPolicies.map((x) => (x.rating * 20 * 0.4) + (parseFloat(x.claimRatio) * 0.3) + ((1000 / x.premium) * 0.3)));
                      return (
                        <td key={p.id} className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-gray-200">
                              <div
                                className={clsx('h-2 rounded-full transition-all', score === maxScore ? 'bg-green-500' : 'bg-blue-500')}
                                style={{ width: `${Math.min(100, score)}%` }}
                              />
                            </div>
                            <span className={clsx('text-sm font-bold', score === maxScore ? 'text-green-600' : 'text-gray-600')}>
                              {score.toFixed(0)}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 bg-gray-50/50 p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {comparedPolicies.map((p) => (
                  <div key={p.id} className="flex gap-2">
                    <a
                      href={`/checkout?policy=${p.id}`}
                      className="flex-1 rounded-lg bg-orange-500 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      Buy {p.provider.split(' ')[0]}
                    </a>
                    <a
                      href={`/policies?provider=${p.provider}`}
                      className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 transition hover:bg-white"
                    >
                      <Info className="h-4 w-4" />
                    </a>
                  </div>
                ))}
                {comparedPolicies.length < 4 && (
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-2.5 text-xs text-gray-400">
                    Add more policies to compare
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Need help choosing?</h3>
              <p className="mt-1 text-sm text-blue-200">Our AI advisor can analyze your needs and recommend the best plan</p>
            </div>
            <a
              href="/chat"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 font-semibold text-white transition hover:bg-orange-600 sm:mt-0"
            >
              Ask AI Advisor <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
