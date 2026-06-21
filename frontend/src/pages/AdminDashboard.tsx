import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, AdminProvider } from '@/services/api'
import { useAuthStore } from '@/store'
import { Users, FileText, DollarSign, Activity, Briefcase, ClipboardList, Building2, X, Loader2 } from 'lucide-react'
import FileUpload from '@/components/FileUpload'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ total_users: 0, total_policies: 0, total_purchases: 0, total_revenue: 0 })
  const [loading, setLoading] = useState(true)

  const [providers, setProviders] = useState<AdminProvider[]>([])
  const [providersLoading, setProvidersLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', logo_url: '', provider_type: '', rating: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    adminApi.getDashboard().then(setStats).catch(console.error).finally(() => setLoading(false))
  }, [])

  const loadProviders = useCallback(async () => {
    setProvidersLoading(true)
    try {
      const data = await adminApi.listProviders()
      setProviders(data || [])
    } catch { setProviders([]) }
    setProvidersLoading(false)
  }, [])

  useEffect(() => { loadProviders() }, [loadProviders])

  if (user?.role !== 'admin' && user?.role !== 'agent') return <div className="p-8 text-center text-red-500">Access denied</div>
  if (loading) return <div className="p-8 text-center">Loading...</div>

  const cards = [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Policies', value: stats.total_policies, icon: FileText, color: 'bg-green-500' },
    { label: 'Total Purchases', value: stats.total_purchases, icon: Activity, color: 'bg-purple-500' },
    { label: 'Total Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-orange-500' },
  ]

  const handleCreate = async () => {
    if (!form.name.trim()) { setSaveError('Name is required'); return }
    setSaving(true)
    setSaveError('')
    try {
      await adminApi.createProvider({
        name: form.name.trim(),
        logo_url: form.logo_url || undefined,
        provider_type: form.provider_type || undefined,
        rating: form.rating ? Number(form.rating) : undefined,
      })
      setShowModal(false)
      setForm({ name: '', logo_url: '', provider_type: '', rating: '' })
      loadProviders()
    } catch (e: any) {
      setSaveError(e.response?.data?.detail || e.message)
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-28">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`rounded-lg ${card.color} p-3 text-white`}>
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Management</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link to="/admin/users" className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600"><Users className="h-5 w-5" /></div>
              <div><p className="font-semibold text-gray-900">Users</p><p className="text-xs text-gray-500">Manage users</p></div>
            </Link>
            <Link to="/admin/providers" className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600"><Building2 className="h-5 w-5" /></div>
              <div><p className="font-semibold text-gray-900">Providers</p><p className="text-xs text-gray-500">Manage providers</p></div>
            </Link>
            <Link to="/admin/policies" className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="rounded-lg bg-green-100 p-3 text-green-600"><FileText className="h-5 w-5" /></div>
              <div><p className="font-semibold text-gray-900">Policies</p><p className="text-xs text-gray-500">Manage policies</p></div>
            </Link>
            <Link to="/admin/jobs" className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="rounded-lg bg-purple-100 p-3 text-purple-600"><Briefcase className="h-5 w-5" /></div>
              <div><p className="font-semibold text-gray-900">Jobs</p><p className="text-xs text-gray-500">Manage job postings</p></div>
            </Link>
            <Link to="/admin/job-applications" className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="rounded-lg bg-orange-100 p-3 text-orange-600"><ClipboardList className="h-5 w-5" /></div>
              <div><p className="font-semibold text-gray-900">Applications</p><p className="text-xs text-gray-500">Review applications</p></div>
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Insurance Providers</h2>
            <button onClick={() => { setSaveError(''); setShowModal(true) }} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
              <Building2 className="h-4 w-4" /> New Provider
            </button>
          </div>
          {providersLoading ? (
            <div className="text-center py-8 text-gray-400">Loading providers...</div>
          ) : (
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Logo</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-center">Rating</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {providers.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500">#{p.id}</td>
                      <td className="px-4 py-3">
                        {p.logo_url ? (
                          <img src={p.logo_url} alt="" className="h-8 w-8 rounded object-contain" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-400"><Building2 className="h-4 w-4" /></div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">{p.provider_type || '-'}</span></td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-yellow-600">{p.rating.toFixed(1)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to="/admin/providers" className="text-indigo-600 hover:underline text-xs font-medium">View All</Link>
                      </td>
                    </tr>
                  ))}
                  {providers.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No providers yet. Click "New Provider" to create one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">New Provider</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                <FileUpload currentUrl={form.logo_url} onUploaded={(url) => setForm({...form, logo_url: url})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.provider_type} onChange={e => setForm({...form, provider_type: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
                    <option value="">-- Select --</option>
                    <option value="life">Life</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <input value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
                </div>
              </div>
              {form.logo_url && <img src={form.logo_url} alt="preview" className="h-12 rounded" onError={e => (e.target as HTMLImageElement).style.display='none'} />}
              {saveError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{saveError}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleCreate} disabled={!form.name.trim() || saving} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70 transition">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
