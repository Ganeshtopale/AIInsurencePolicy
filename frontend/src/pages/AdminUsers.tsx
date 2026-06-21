import { useState, useEffect } from 'react'
import { adminApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { Search, Plus, X, ShieldAlert, Loader2, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'

export default function AdminUsers() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', username: '', password: '' })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    adminApi.getUsers().then(setUsers).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (u: any) => {
    await adminApi.updateUser(u.id, { is_active: !u.is_active })
    load()
  }

  const changeRole = async (u: any, role: string) => {
    await adminApi.updateUser(u.id, { role })
    load()
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this account? This action cannot be undone.')) return
    setDeletingId(id)
    try {
      await adminApi.deleteUser(id)
      load()
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.response?.data?.message || 'Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.username || !form.password) {
      setFormError('All fields are required')
      return
    }
    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters')
      return
    }
    setCreating(true)
    try {
      const res = await adminApi.createAdmin(form)
      setFormSuccess(res.message)
      setForm({ first_name: '', last_name: '', email: '', phone: '', username: '', password: '' })
      load()
    } catch (err: any) {
      setFormError(err?.response?.data?.detail || err?.response?.data?.message || 'Failed to create admin')
    } finally {
      setCreating(false)
    }
  }

  if (user?.role !== 'admin') return <div className="p-8 text-center text-red-500">Access denied</div>

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Search users..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 lg:w-64 rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <button
              onClick={() => { setShowCreate(true); setFormError(''); setFormSuccess('') }}
              className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900"
            >
              <Plus className="h-4 w-4" /> Create Admin
            </button>
          </div>
        </div>

        {/* Create Admin Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-gray-800" />
                  <h2 className="text-lg font-bold text-gray-900">Create New Admin</h2>
                </div>
                <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreateAdmin} className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      placeholder="John" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      placeholder="Doe" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@example.com" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="9876543210" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="johndoe" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 6 chars" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  </div>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4 shrink-0" /> {formSuccess}
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowCreate(false)}
                    className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={creating}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gray-800 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:opacity-70">
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                    {creating ? 'Creating...' : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Phone</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role} onChange={(e) => changeRole(u, e.target.value)}
                        className="rounded border border-gray-200 px-2 py-1 text-xs outline-none"
                      >
                        <option value="customer">Customer</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(u)}
                          className={`rounded px-3 py-1 text-xs font-medium transition ${
                            u.is_active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {u.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingId === u.id}
                          className="rounded px-3 py-1 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                        >
                          {deletingId === u.id ? <Loader2 className="h-3 w-3 animate-spin inline" /> : <Trash2 className="h-3 w-3 inline" />}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
