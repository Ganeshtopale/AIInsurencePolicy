import { useState, useEffect } from 'react'
import { adminApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

const POLICY_TYPES = ['term', 'health', 'motor', 'investment', 'travel', 'car', 'bike', 'home', 'pet', 'personal', 'child', 'retirement', 'pension', 'ulip', 'group-health', 'corporate', 'cancer', 'family-health', 'home-loan', 'taxi', 'commercial-vehicle']

export default function AdminPolicies() {
  const { user } = useAuthStore()
  const [policies, setPolicies] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', provider_id: 0, policy_type: 'term', premium: 0, coverage_amount: 0, description: '', rating: 4.0 })

  const load = () => {
    setLoading(true)
    Promise.all([
      adminApi.getPolicies(),
      adminApi.listProviders(),
    ]).then(([p, pr]) => {
      setPolicies(p)
      setProviders(pr)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', provider_id: providers[0]?.id || 0, policy_type: 'term', premium: 0, coverage_amount: 0, description: '', rating: 4.0 })
    setShowModal(true)
  }

  const openEdit = (p: any) => {
    setEditing(p)
    setForm({ name: p.name, provider_id: p.provider_id, policy_type: p.policy_type, premium: p.premium, coverage_amount: p.coverage_amount, description: p.description || '', rating: p.rating })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.provider_id) { alert('Please select a provider'); return }
    try {
      if (editing) {
        await adminApi.updatePolicy(editing.id, form)
      } else {
        await adminApi.createPolicy(form)
      }
      setShowModal(false)
      load()
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this policy?')) return
    await adminApi.deletePolicy(id)
    load()
  }

  if (user?.role !== 'admin' && user?.role !== 'agent') return <div className="p-8 text-center text-red-500">Access denied</div>

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Policy Management</h1>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add Policy
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Provider</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Premium</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Coverage</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {policies.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.provider_logo && <img src={p.provider_logo} alt="" className="inline h-5 mr-1" />}
                      {p.provider_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 uppercase">{p.policy_type}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">₹{p.premium.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-900">₹{p.coverage_amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>{p.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="rounded p-1.5 text-blue-600 hover:bg-blue-50"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Edit Policy' : 'Add Policy'}</h2>
              <button onClick={() => setShowModal(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Provider</label>
                  <select required value={form.provider_id} onChange={(e) => setForm({ ...form, provider_id: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400">
                    <option value={0}>-- Select Provider --</option>
                    {providers.map(pr => (
                      <option key={pr.id} value={pr.id}>{pr.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select value={form.policy_type} onChange={(e) => setForm({ ...form, policy_type: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400">
                    {POLICY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Premium (₹)</label>
                  <input type="number" required min="0" value={form.premium} onChange={(e) => setForm({ ...form, premium: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Coverage (₹)</label>
                  <input type="number" required min="0" value={form.coverage_amount} onChange={(e) => setForm({ ...form, coverage_amount: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
