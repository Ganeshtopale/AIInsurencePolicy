import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  TrendingUp,
  Target,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Search,
  Plus,
  ChevronRight,
  Download,
  Clock,
  CheckCircle,
  Bot,
  MessageSquare,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/store';
import { leadApi, policyApi } from '@/services/api';

type StatCard = {
  icon: React.ElementType;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  color: string;
};

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  policy: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed' | 'lost';
  score: number;
  date: string;
  agent?: string;
};

type Activity = {
  id: string;
  type: 'lead' | 'policy' | 'claim' | 'payment' | 'chat';
  text: string;
  time: string;
  user: string;
};

const FALLBACK_STATS: StatCard[] = [
  { icon: Users, label: 'Total Leads', value: '1,284', change: 12.5, changeLabel: 'vs last month', color: 'from-blue-500 to-blue-600' },
  { icon: FileText, label: 'Active Policies', value: '847', change: 8.3, changeLabel: 'vs last month', color: 'from-orange-400 to-orange-600' },
  { icon: TrendingUp, label: 'Conversion Rate', value: '24.8%', change: 3.2, changeLabel: 'vs last month', color: 'from-green-500 to-green-600' },
  { icon: Target, label: 'Monthly Target', value: '₹45.2L', change: -5.1, changeLabel: 'vs last month', color: 'from-purple-500 to-purple-600' },
];

const FALLBACK_LEADS: Lead[] = [
  { id: 'L-1024', name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh.k@email.com', policy: 'Smart Term Plan', status: 'new', score: 92, date: '5 min ago' },
  { id: 'L-1023', name: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya.s@email.com', policy: 'Complete Health Shield', status: 'contacted', score: 88, date: '1 hour ago' },
  { id: 'L-1022', name: 'Amit Patel', phone: '+91 76543 21098', email: 'amit.p@email.com', policy: 'Motor Insurance', status: 'qualified', score: 85, date: '3 hours ago' },
  { id: 'L-1021', name: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha.r@email.com', policy: 'Wealth Growth Plan', status: 'proposal', score: 78, date: '5 hours ago' },
  { id: 'L-1020', name: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram.s@email.com', policy: 'Smart Term Plan', status: 'closed', score: 95, date: '1 day ago' },
  { id: 'L-1019', name: 'Anita Desai', phone: '+91 43210 98765', email: 'anita.d@email.com', policy: 'Complete Health Shield', status: 'lost', score: 45, date: '2 days ago' },
];

const FALLBACK_ACTIVITIES: Activity[] = [
  { id: 'a1', type: 'lead', text: 'New lead Rajesh Kumar interested in Term Life', time: '5 min ago', user: 'AI Auto' },
  { id: 'a2', type: 'payment', text: 'Payment of ₹45,600 received for Policy POL-A2B3', time: '15 min ago', user: 'System' },
  { id: 'a3', type: 'chat', text: 'Priya Sharma chatted with AI Advisor for 12 mins', time: '1 hour ago', user: 'AI Advisor' },
  { id: 'a4', type: 'claim', text: 'Claim CLM-8921 approved - ₹2,50,000 disbursed', time: '2 hours ago', user: 'Claims Team' },
  { id: 'a5', type: 'policy', text: 'Policy POL-C4D5 renewed for Amit Patel', time: '3 hours ago', user: 'System' },
  { id: 'a6', type: 'lead', text: 'Lead score updated: Sneha Reddy 78 → 85', time: '5 hours ago', user: 'AI Auto' },
  { id: 'a7', type: 'payment', text: 'Refund processed for Policy POL-E6F7', time: '6 hours ago', user: 'Finance' },
];

const FALLBACK_CHART_DATA = [
  { month: 'Jan', leads: 85, policies: 52 },
  { month: 'Feb', leads: 95, policies: 58 },
  { month: 'Mar', leads: 110, policies: 65 },
  { month: 'Apr', leads: 88, policies: 54 },
  { month: 'May', leads: 125, policies: 72 },
  { month: 'Jun', leads: 105, policies: 61 },
  { month: 'Jul', leads: 140, policies: 78 },
  { month: 'Aug', leads: 128, policies: 70 },
  { month: 'Sep', leads: 145, policies: 82 },
  { month: 'Oct', leads: 118, policies: 68 },
  { month: 'Nov', leads: 135, policies: 75 },
  { month: 'Dec', leads: 150, policies: 85 },
];

const FALLBACK_PERFORMANCE = [
  { label: 'Term Life', value: 35, color: 'bg-blue-500' },
  { label: 'Health', value: 28, color: 'bg-orange-500' },
  { label: 'Investment', value: 18, color: 'bg-green-500' },
  { label: 'Motor', value: 12, color: 'bg-purple-500' },
  { label: 'Travel', value: 7, color: 'bg-teal-500' },
];

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-orange-100 text-orange-700',
  proposal: 'bg-purple-100 text-purple-700',
  closed: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

const quickActions = [
  { icon: Plus, label: 'Add Lead', href: '#', color: 'bg-blue-600' },
  { icon: MessageSquare, label: 'AI Advisor', href: '/chat', color: 'bg-orange-500' },
  { icon: FileText, label: 'New Policy', href: '/policies', color: 'bg-green-600' },
  { icon: Download, label: 'Reports', href: '#', color: 'bg-purple-600' },
];

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [statCards, setStatCards] = useState<StatCard[]>(FALLBACK_STATS);
  const [recentLeads, setRecentLeads] = useState<Lead[]>(FALLBACK_LEADS);
  const [chartData] = useState(FALLBACK_CHART_DATA);
  const [performanceData, setPerformanceData] = useState(FALLBACK_PERFORMANCE);
  const [activities] = useState(FALLBACK_ACTIVITIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [leadsRes, policiesRes] = await Promise.allSettled([
          leadApi.getLeads({}),
          policyApi.getPolicies({}),
        ]);

        if (cancelled) return;

        if (leadsRes.status === 'fulfilled' && policiesRes.status === 'fulfilled') {
          const leads = leadsRes.value.data || [];
          const policies = policiesRes.value || [];

          const closedCount = leads.filter((l: any) => l.status === 'closed' || l.status === 'won').length;
          const avgScore = leads.length > 0 ? Math.round(leads.reduce((s: number, l: any) => s + (l.score?.overall || l.score || 0), 0) / leads.length) : 0;

          setStatCards([
            { icon: Users, label: 'Total Leads', value: formatCount(leads.length), change: 12.5, changeLabel: 'vs last month', color: 'from-blue-500 to-blue-600' },
            { icon: FileText, label: 'Active Policies', value: formatCount(policies.length), change: 8.3, changeLabel: 'vs last month', color: 'from-orange-400 to-orange-600' },
            { icon: TrendingUp, label: 'Avg Score', value: `${avgScore}`, change: 3.2, changeLabel: 'vs last month', color: 'from-green-500 to-green-600' },
            { icon: Target, label: 'Conversions', value: formatCount(closedCount), change: -5.1, changeLabel: 'vs last month', color: 'from-purple-500 to-purple-600' },
          ]);

          setRecentLeads(leads.slice(0, 6).map((l: any) => ({
            id: l.id,
            name: l.name,
            phone: l.phone,
            email: l.email,
            policy: l.insuranceType || l.policyInterest || 'General',
            status: (l.status === 'won' ? 'closed' : l.status === 'negotiation' ? 'qualified' : l.status) as Lead['status'],
            score: l.score?.overall || l.score || 0,
            date: l.updatedAt ? new Date(l.updatedAt).toLocaleDateString('en-IN') : '—',
          })));

          const typeCount: Record<string, number> = {};
          policies.forEach((p: any) => {
            const t = p.type || 'other';
            typeCount[t] = (typeCount[t] || 0) + 1;
          });
          const totalP = Object.values(typeCount).reduce((a: number, b: number) => a + b, 0) || 1;
          const colors = ['bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-teal-500', 'bg-red-500'];
          setPerformanceData(
            Object.entries(typeCount).slice(0, 6).map(([label, value], i) => ({
              label: label.charAt(0).toUpperCase() + label.slice(1),
              value: Math.round((value as number / totalP) * 100),
              color: colors[i % colors.length],
            }))
          );
        } else {
          setError('Could not load all data. Showing sample data.');
        }
      } catch {
        if (!cancelled) setError('Could not load dashboard data. Showing sample data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const filteredLeads = recentLeads.filter((lead) => {
    if (selectedStatus && lead.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return lead.name.toLowerCase().includes(q) || lead.id.toLowerCase().includes(q) || lead.policy.toLowerCase().includes(q);
    }
    return true;
  });

  const maxLeads = Math.max(...chartData.map((d) => d.leads));
  const maxPolicies = Math.max(...chartData.map((d) => d.policies));
  const totalPerformance = performanceData.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-28">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">{loading ? 'Loading dashboard...' : "Welcome back! Here's your insurance portfolio overview."}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
              <Plus className="h-4 w-4" /> New Policy
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 border border-yellow-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white p-5 shadow-sm">
                <div className="h-10 w-10 rounded-lg bg-gray-200" />
                <div className="mt-4 h-8 w-20 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-24 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial="initial"
            animate="animate"
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
          >
            {statCards.map((stat) => {
              const Icon = stat.icon;
              const isPositive = stat.change >= 0;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white', stat.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={clsx('flex items-center gap-0.5 text-xs font-medium', isPositive ? 'text-green-600' : 'text-red-500')}>
                      {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {Math.abs(stat.change)}%
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{stat.changeLabel}</p>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Leads & Policies Overview</h3>
                <p className="text-xs text-gray-400">Monthly performance for 2026</p>
              </div>
              <BarChart3 className="h-5 w-5 text-gray-300" />
            </div>
            <div className="mt-6 flex items-end justify-between gap-1" style={{ height: 140 }}>
              {chartData.map((d) => (
                <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5" style={{ height: 120 }}>
                    <div
                      className="w-3/4 rounded-t bg-orange-400 transition-all hover:bg-orange-500"
                      style={{ height: `${(d.leads / maxLeads) * 80}px` }}
                      title={`Leads: ${d.leads}`}
                    />
                    <div
                      className="w-3/4 rounded-t bg-blue-600 transition-all hover:bg-blue-700"
                      style={{ height: `${(d.policies / maxPolicies) * 60}px` }}
                      title={`Policies: ${d.policies}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-orange-400" /> Leads</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-blue-600" /> Policies</span>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Policy Distribution</h3>
                <p className="text-xs text-gray-400">By product type</p>
              </div>
              <PieChart className="h-5 w-5 text-gray-300" />
            </div>
            <div className="mt-6 space-y-3">
              {performanceData.map((p) => (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{p.label}</span>
                    <span className="font-medium text-gray-900">{p.value}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                    <div className={clsx('h-2 rounded-full transition-all', p.color)} style={{ width: `${p.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-100 pt-3 text-center text-xs text-gray-400">
              Total: 100% ({totalPerformance}% shown)
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Recent Leads</h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{recentLeads.length} total</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" placeholder="Search leads..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="closed">Closed</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-xs text-gray-400">
                  <th className="px-6 py-3 text-left font-medium">Lead ID</th>
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="hidden px-6 py-3 text-left font-medium md:table-cell">Contact</th>
                  <th className="hidden px-6 py-3 text-left font-medium lg:table-cell">Policy</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Score</th>
                  <th className="px-6 py-3 text-left font-medium">Date</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-50 transition hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-xs font-medium text-blue-600">{lead.id}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-orange-400 text-xs font-bold text-white">
                          {lead.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{lead.name}</span>
                      </div>
                    </td>
                    <td className="hidden px-6 py-3 md:table-cell">
                      <div className="text-xs">
                        <p className="text-gray-900">{lead.phone}</p>
                        <p className="text-gray-400">{lead.email}</p>
                      </div>
                    </td>
                    <td className="hidden px-6 py-3 lg:table-cell"><span className="text-gray-600">{lead.policy}</span></td>
                    <td className="px-6 py-3">
                      <span className={clsx('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize', statusColors[lead.status])}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 rounded-full bg-gray-100">
                          <div
                            className={clsx('h-1.5 rounded-full', lead.score >= 80 ? 'bg-green-500' : lead.score >= 60 ? 'bg-orange-400' : 'bg-red-400')}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className={clsx('text-xs font-medium', lead.score >= 80 ? 'text-green-600' : lead.score >= 60 ? 'text-orange-600' : 'text-red-600')}>
                          {lead.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-400">{lead.date}</td>
                    <td className="px-6 py-3 text-right">
                      <button className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-6 py-3">
            <a href="/leads" className="flex items-center justify-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700">
              View All Leads <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="mt-4 space-y-0">
              {activities.map((a, i) => (
                <div key={a.id} className={clsx('flex gap-3 py-3', i < activities.length - 1 && 'border-b border-gray-50')}>
                  <div className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', {
                    'bg-blue-100 text-blue-600': a.type === 'lead',
                    'bg-green-100 text-green-600': a.type === 'policy',
                    'bg-red-100 text-red-600': a.type === 'claim',
                    'bg-yellow-100 text-yellow-600': a.type === 'payment',
                    'bg-orange-100 text-orange-600': a.type === 'chat',
                  })}>
                    {a.type === 'lead' && <Users className="h-4 w-4" />}
                    {a.type === 'policy' && <FileText className="h-4 w-4" />}
                    {a.type === 'claim' && <CheckCircle className="h-4 w-4" />}
                    {a.type === 'payment' && <TrendingUp className="h-4 w-4" />}
                    {a.type === 'chat' && <MessageSquare className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{a.text}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                      <span>{a.user}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{a.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-xs text-gray-400">Common tasks at your fingertips</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <a
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center gap-2 rounded-xl p-4 text-center transition hover:shadow-md"
                  >
                    <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg text-white', action.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{action.label}</span>
                  </a>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-4">
              <div className="flex items-center gap-2 text-white">
                <Bot className="h-5 w-5" />
                <span className="font-medium">AI Assistant</span>
              </div>
              <p className="mt-1 text-xs text-blue-200">Get lead insights and recommendations</p>
              <a href="/chat" className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50">
                Open Chat <ChevronRight className="h-3 w-3" />
              </a>
            </div>

            <div className="mt-4 rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Daily Report</p>
                  <p className="text-xs text-gray-400">PDF summary of today</p>
                </div>
                <Download className="h-5 w-5 text-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
