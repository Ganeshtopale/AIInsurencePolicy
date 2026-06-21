import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Bot,
  UserCheck,
  MessageSquare,
  TrendingUp,
  Shield,
  Heart,
  Car,
  MoreHorizontal,
} from 'lucide-react';
import clsx from 'clsx';
import { leadApi } from '@/services/api';

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  age: number;
  income: string;
  policyInterest: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed' | 'lost';
  score: number;
  scoreBreakdown: { factor: string; points: number; max: number }[];
  assignedAgent?: string;
  date: string;
  lastContacted: string;
  notes: string;
  aiSummary: string;
  aiRecommendation: string;
};

const FALLBACK_LEADS: Lead[] = [
  {
    id: 'L-1024', name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh.k@email.com',
    city: 'Mumbai', age: 34, income: '₹12 Lakh', policyInterest: 'Term Life',
    status: 'new', score: 92,
    scoreBreakdown: [
      { factor: 'Income Stability', points: 28, max: 30 },
      { factor: 'Family Size', points: 18, max: 20 },
      { factor: 'Age Factor', points: 15, max: 20 },
      { factor: 'Policy Fit', points: 20, max: 20 },
      { factor: 'Engagement', points: 11, max: 10 },
    ],
    assignedAgent: 'Unassigned', date: '2026-06-12', lastContacted: '—',
    notes: 'Looking for term cover of ₹1 Cr for family protection. Married with 1 child.',
    aiSummary: 'High-intent buyer with strong financial profile. Family man seeking term coverage. Recommend Smart Term Plan with critical illness add-on.',
    aiRecommendation: 'Contact immediately. Offer ₹1 Cr Smart Term Plan with Critical Illness add-on.',
  },
  {
    id: 'L-1023', name: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya.s@email.com',
    city: 'Delhi', age: 29, income: '₹8 Lakh', policyInterest: 'Health Insurance',
    status: 'contacted', score: 88,
    scoreBreakdown: [
      { factor: 'Income Stability', points: 22, max: 30 },
      { factor: 'Family Size', points: 19, max: 20 },
      { factor: 'Age Factor', points: 17, max: 20 },
      { factor: 'Policy Fit', points: 18, max: 20 },
      { factor: 'Engagement', points: 12, max: 10 },
    ],
    assignedAgent: 'Rahul Sharma', date: '2026-06-12', lastContacted: '1 hour ago',
    notes: 'Needs family health cover for self, husband and parents. Budget ~₹25K/year.',
    aiSummary: 'Young professional looking for family floater health plan. Good engagement, needs comprehensive cover with maternity options.',
    aiRecommendation: 'Share Complete Health Shield and Optima Restore plans for comparison.',
  },
  {
    id: 'L-1022', name: 'Amit Patel', phone: '+91 76543 21098', email: 'amit.p@email.com',
    city: 'Ahmedabad', age: 42, income: '₹15 Lakh', policyInterest: 'Car Insurance',
    status: 'qualified', score: 85,
    scoreBreakdown: [
      { factor: 'Income Stability', points: 26, max: 30 },
      { factor: 'Family Size', points: 14, max: 20 },
      { factor: 'Age Factor', points: 16, max: 20 },
      { factor: 'Policy Fit', points: 19, max: 20 },
      { factor: 'Engagement', points: 10, max: 10 },
    ],
    assignedAgent: 'Priya Verma', date: '2026-06-11', lastContacted: '3 hours ago',
    notes: 'Car insurance renewal due in 15 days. Current insurer quote is ₹8,200.',
    aiSummary: 'Renewal lead with high conversion probability. Price sensitive - looking for savings of 30%+.',
    aiRecommendation: 'Offer Bajaj Allianz Motor Insurance at ₹7,500 with Zero Dep add-on.',
  },
  {
    id: 'L-1021', name: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha.r@email.com',
    city: 'Bangalore', age: 31, income: '₹18 Lakh', policyInterest: 'Investment Plan',
    status: 'proposal', score: 78,
    scoreBreakdown: [
      { factor: 'Income Stability', points: 30, max: 30 },
      { factor: 'Family Size', points: 12, max: 20 },
      { factor: 'Age Factor', points: 13, max: 20 },
      { factor: 'Policy Fit', points: 14, max: 20 },
      { factor: 'Engagement', points: 9, max: 10 },
    ],
    assignedAgent: 'Amit Joshi', date: '2026-06-11', lastContacted: '5 hours ago',
    notes: 'Comparing Wealth Growth Plan vs market mutual funds. Need tax saving options.',
    aiSummary: 'High-income earner with investment focus. Needs clarity on insurance vs investment benefits. Tax saving angle is key.',
    aiRecommendation: 'Demonstrate Wealth Growth Plan returns vs MFs. Highlight 80C tax benefits.',
  },
  {
    id: 'L-1020', name: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram.s@email.com',
    city: 'Pune', age: 38, income: '₹20 Lakh', policyInterest: 'Term Life',
    status: 'closed', score: 95,
    scoreBreakdown: [
      { factor: 'Income Stability', points: 30, max: 30 },
      { factor: 'Family Size', points: 20, max: 20 },
      { factor: 'Age Factor', points: 18, max: 20 },
      { factor: 'Policy Fit', points: 20, max: 20 },
      { factor: 'Engagement', points: 7, max: 10 },
    ],
    assignedAgent: 'Sneha Patel', date: '2026-06-10', lastContacted: '1 day ago',
    notes: 'Policy purchased - Smart Term Plan ₹1.5 Cr cover. Annual premium ₹6,800.',
    aiSummary: 'Converted successfully. High-value policy with excellent premium-to-cover ratio.',
    aiRecommendation: 'Upsell Critical Illness add-on and recommend health insurance for family.',
  },
  {
    id: 'L-1019', name: 'Anita Desai', phone: '+91 43210 98765', email: 'anita.d@email.com',
    city: 'Chennai', age: 55, income: '₹6 Lakh', policyInterest: 'Health Insurance',
    status: 'lost', score: 45,
    scoreBreakdown: [
      { factor: 'Income Stability', points: 14, max: 30 },
      { factor: 'Family Size', points: 10, max: 20 },
      { factor: 'Age Factor', points: 8, max: 20 },
      { factor: 'Policy Fit', points: 10, max: 20 },
      { factor: 'Engagement', points: 3, max: 10 },
    ],
    assignedAgent: 'Rahul Sharma', date: '2026-06-08', lastContacted: '2 days ago',
    notes: 'Found expensive for age bracket. Pre-existing condition concerns.',
    aiSummary: 'Low fit due to age and budget constraints. Pre-existing conditions need waiting period explanation.',
    aiRecommendation: 'Re-engage with senior citizen plans. Highlight gradual coverage increase.',
  },
];

const agents = ['Rahul Sharma', 'Priya Verma', 'Amit Joshi', 'Sneha Patel', 'Unassigned'];

const statusFilters = [
  { value: '', label: 'All Status', color: 'bg-gray-100 text-gray-700' },
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'qualified', label: 'Qualified', color: 'bg-orange-100 text-orange-700' },
  { value: 'proposal', label: 'Proposal', color: 'bg-purple-100 text-purple-700' },
  { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-700' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700' },
];

const policyIcons: Record<string, React.ElementType> = {
  'Term Life': Shield,
  'Health Insurance': Heart,
  'Car Insurance': Car,
  'Investment Plan': TrendingUp,
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

function mapApiLead(l: any): Lead {
  const breakdown = l.score?.breakdown?.map((b: any) => ({
    factor: b.category || b.factor || 'Factor',
    points: b.score || b.points || 0,
    max: b.maxScore || b.max || 10,
  })) || [
    { factor: 'Intent', points: Math.round((l.score?.intent || 7) * 3.3), max: 30 },
    { factor: 'Affordability', points: Math.round((l.score?.affordability || 7) * 2.8), max: 20 },
    { factor: 'Urgency', points: Math.round((l.score?.urgency || 7) * 2.8), max: 20 },
    { factor: 'Trust', points: Math.round((l.score?.trust || 7) * 2.2), max: 20 },
    { factor: 'Engagement', points: Math.round((l.score?.engagement || 7) * 1.2), max: 10 },
  ];
  return {
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email,
    city: l.city || '',
    age: l.age || 0,
    income: l.income ? `₹${l.income}L` : '—',
    policyInterest: l.insuranceType || l.policyInterest || 'General',
    status: (l.status === 'won' ? 'closed' : l.status === 'negotiation' ? 'qualified' : l.status) as Lead['status'],
    score: l.score?.overall || l.score || 0,
    scoreBreakdown: breakdown,
    assignedAgent: l.assignedAgent || 'Unassigned',
    date: l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN') : '—',
    lastContacted: l.updatedAt ? new Date(l.updatedAt).toLocaleDateString('en-IN') : '—',
    notes: l.notes || '',
    aiSummary: l.aiSummary || 'Lead analysis available upon assignment.',
    aiRecommendation: l.aiRecommendation || 'Contact the lead to understand requirements.',
  };
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-60 rounded bg-gray-100" />
            </div>
            <div className="h-9 w-16 rounded bg-gray-200" />
            <div className="h-8 w-20 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Leads() {
  const [leadsData, setLeadsData] = useState<Lead[]>(FALLBACK_LEADS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await leadApi.getLeads({});
        if (!cancelled) {
          const mapped = (res.data || []).map(mapApiLead);
          setLeadsData(mapped.length > 0 ? mapped : FALLBACK_LEADS);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load leads from server. Showing sample data.');
          setLeadsData(FALLBACK_LEADS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchLeads();
    return () => { cancelled = true; };
  }, []);

  const filteredLeads = leadsData.filter((lead) => {
    if (selectedStatus && lead.status !== selectedStatus) return false;
    if (lead.score < scoreRange[0] || lead.score > scoreRange[1]) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.id.toLowerCase().includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        lead.policyInterest.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAssignAgent = async (leadId: string, agent: string) => {
    setUpdating(leadId);
    try {
      await leadApi.updateLead(leadId, { assignedAgent: agent } as any);
      setLeadsData((prev) => prev.map((l) => l.id === leadId ? { ...l, assignedAgent: agent } : l));
    } catch {
      setLeadsData((prev) => prev.map((l) => l.id === leadId ? { ...l, assignedAgent: agent } : l));
    } finally {
      setUpdating(null);
      setShowAssign(null);
    }
  };

  const averageScore = leadsData.length > 0 ? Math.round(leadsData.reduce((sum, l) => sum + l.score, 0) / leadsData.length) : 0;
  const conversionCount = leadsData.filter((l) => l.status === 'closed').length;
  const conversionRate = leadsData.length > 0 ? Math.round((conversionCount / leadsData.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
            <p className="mt-1 text-sm text-gray-500">{loading ? 'Loading leads...' : 'Track, manage and convert your insurance leads'}</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
            <Users className="h-4 w-4" /> Add Lead
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 border border-yellow-200">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Leads', value: leadsData.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Avg Score', value: averageScore, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Converted', value: conversionCount, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat) => (
            <div key={stat.label} className={clsx('rounded-xl p-4', stat.bg)}>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={clsx('mt-1 text-2xl font-bold', stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Search by name, ID, city..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {statusFilters.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelectedStatus(s.value)}
                  className={clsx(
                    'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition',
                    selectedStatus === s.value ? 'bg-blue-600 text-white' : s.color,
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span>Score:</span>
              <input
                type="range" min={0} max={100} value={scoreRange[0]}
                onChange={(e) => setScoreRange([parseInt(e.target.value), scoreRange[1]])}
                className="w-20 accent-blue-600"
              />
              <span className="text-xs font-medium text-gray-700">{scoreRange[0]} - {scoreRange[1]}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <AnimatePresence>
              {filteredLeads.map((lead) => {
                const isExpanded = expandedLead === lead.id;
                const PolicyIcon = policyIcons[lead.policyInterest] || Shield;
                return (
                  <motion.div
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="rounded-xl bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center gap-4 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-orange-400 text-lg font-bold text-white">
                        {lead.name.split(' ').map((n) => n[0]).join('')}
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                          <span className="font-mono text-xs text-gray-400">{lead.id}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {lead.city}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {lead.date}</span>
                          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {lead.income}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className={clsx('flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold', getScoreColor(lead.score))}>
                            {lead.score}
                          </div>
                        </div>
                        <span className={clsx('rounded-full px-2.5 py-1 text-[11px] font-medium capitalize', {
                          'bg-blue-100 text-blue-700': lead.status === 'new',
                          'bg-yellow-100 text-yellow-700': lead.status === 'contacted',
                          'bg-orange-100 text-orange-700': lead.status === 'qualified',
                          'bg-purple-100 text-purple-700': lead.status === 'proposal',
                          'bg-green-100 text-green-700': lead.status === 'closed',
                          'bg-red-100 text-red-700': lead.status === 'lost',
                        })}>
                          {lead.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <button className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-gray-100"
                        >
                          <div className="p-5">
                            <div className="grid gap-6 lg:grid-cols-3">
                              <div>
                                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Contact Info</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="h-4 w-4 text-gray-400" /> {lead.phone}
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="h-4 w-4 text-gray-400" /> {lead.email}
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="h-4 w-4 text-gray-400" /> {lead.city}
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="h-4 w-4 text-gray-400" /> Last: {lead.lastContacted}
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-500">Assigned Agent</span>
                                    <button
                                      onClick={() => setShowAssign(showAssign === lead.id ? null : lead.id)}
                                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                    >
                                      {showAssign === lead.id ? 'Cancel' : 'Change'}
                                    </button>
                                  </div>
                                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                                    <UserCheck className="h-4 w-4 text-gray-400" />
                                    {updating === lead.id ? 'Updating...' : lead.assignedAgent}
                                  </div>
                                  <AnimatePresence>
                                    {showAssign === lead.id && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-2 overflow-hidden"
                                      >
                                        <div className="flex flex-wrap gap-1">
                                          {agents.map((agent) => (
                                            <button
                                              key={agent}
                                              onClick={() => handleAssignAgent(lead.id, agent)}
                                              disabled={updating === lead.id}
                                              className={clsx(
                                                'rounded-full px-2.5 py-1 text-xs font-medium transition',
                                                lead.assignedAgent === agent
                                                  ? 'bg-blue-600 text-white'
                                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                                              )}
                                            >
                                              {agent}
                                            </button>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                                <div className="mt-4">
                                  <span className="text-xs font-medium text-gray-500">Interest</span>
                                  <div className="mt-1 flex items-center gap-2 text-sm">
                                    <PolicyIcon className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-gray-900">{lead.policyInterest}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Score Breakdown</h4>
                                <div className="space-y-2">
                                  {lead.scoreBreakdown.map((s) => (
                                    <div key={s.factor}>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">{s.factor}</span>
                                        <span className="font-medium text-gray-900">{s.points}/{s.max}</span>
                                      </div>
                                      <div className="mt-0.5 h-1.5 w-full rounded-full bg-gray-100">
                                        <div
                                          className={clsx('h-1.5 rounded-full', s.points / s.max >= 0.8 ? 'bg-green-500' : s.points / s.max >= 0.6 ? 'bg-orange-400' : 'bg-red-400')}
                                          style={{ width: `${(s.points / s.max) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-2 text-xs">
                                  <Star className="h-3.5 w-3.5 text-orange-400" />
                                  <span className="font-medium text-gray-700">Overall Score: {lead.score}/100</span>
                                </div>
                              </div>

                              <div>
                                <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                  <Bot className="h-3.5 w-3.5 text-orange-500" /> AI Analysis
                                </h4>
                                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-orange-50 p-4">
                                  <p className="text-sm leading-relaxed text-gray-700">{lead.aiSummary}</p>
                                </div>
                                <div className="mt-3 rounded-lg border border-orange-100 bg-orange-50/50 p-3">
                                  <div className="flex items-start gap-2">
                                    <Bot className="mt-0.5 h-4 w-4 text-orange-500" />
                                    <div>
                                      <p className="text-xs font-medium text-orange-700">AI Recommendation</p>
                                      <p className="mt-0.5 text-xs text-gray-600">{lead.aiRecommendation}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <p className="text-xs text-gray-400">Agent Notes</p>
                                  <p className="text-sm text-gray-600">{lead.notes}</p>
                                </div>

                                <div className="mt-4 flex gap-2">
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700"
                                  >
                                    <Phone className="h-3.5 w-3.5" /> Call
                                  </a>
                                  <a
                                    href={`mailto:${lead.email}`}
                                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                                  >
                                    <Mail className="h-3.5 w-3.5" /> Email
                                  </a>
                                  <a
                                    href="/chat"
                                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" /> Chat
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {!loading && filteredLeads.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <Users className="h-12 w-12 text-gray-200" />
              <h3 className="mt-4 text-lg font-medium text-gray-500">No leads found</h3>
              <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
