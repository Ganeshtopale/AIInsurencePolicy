import { useEffect, useState, useCallback } from 'react'
import { adminApi, AdminProvider } from '@/services/api'
import FileUpload from '@/components/FileUpload'

const emptyForm = {
  name: '',
  logo_url: '',
  description: '',
  website: '',
  contact_email: '',
  contact_phone: '',
  founded_year: '' as string | number,
  provider_type: '',
  rating: 4.0,
}

export default function AdminProviders() {
  const [providers, setProviders] = useState<AdminProvider[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const data = await adminApi.listProviders()
    setProviders(data)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEdit = (p: AdminProvider) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      logo_url: p.logo_url || '',
      description: p.description || '',
      website: p.website || '',
      contact_email: p.contact_email || '',
      contact_phone: p.contact_phone || '',
      founded_year: p.founded_year || '',
      provider_type: p.provider_type || '',
      rating: p.rating,
    })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      logo_url: form.logo_url || undefined,
      description: form.description || undefined,
      website: form.website || undefined,
      contact_email: form.contact_email || undefined,
      contact_phone: form.contact_phone || undefined,
      founded_year: form.founded_year ? Number(form.founded_year) : undefined,
      provider_type: form.provider_type || undefined,
      rating: Number(form.rating) || 4.0,
    }
    try {
      if (editingId) {
        await adminApi.updateProvider(editingId, payload)
      } else {
        await adminApi.createProvider(payload as any)
      }
      setShowModal(false)
      load()
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this provider?')) return
    try {
      await adminApi.deleteProvider(id)
      load()
    } catch (e: any) {
      alert(e.response?.data?.detail || e.message)
    }
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Insurance Providers</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Provider</button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Website</th>
              <th className="p-2 text-center">Rating</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{p.logo_url && <img src={p.logo_url} alt="" className="inline h-6 mr-2" />}{p.name}</td>
                <td className="p-2">{p.provider_type || '-'}</td>
                <td className="p-2">{p.website ? <a href={p.website} target="_blank" className="text-blue-600 underline">{p.website}</a> : '-'}</td>
                <td className="p-2 text-center">{p.rating.toFixed(1)}</td>
                <td className="p-2 text-center space-x-2">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {providers.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">No providers yet</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Provider' : 'Add Provider'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Name *</label>
                <input type="text" className="w-full border rounded p-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logo</label>
                <FileUpload currentUrl={form.logo_url} onUploaded={(url) => setForm({...form, logo_url: url})} />
              </div>
              <div>
                <label className="block text-sm font-medium">Provider Type (life / general / both)</label>
                <input type="text" className="w-full border rounded p-2" value={form.provider_type} onChange={e => setForm({...form, provider_type: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Website</label>
                  <input type="url" className="w-full border rounded p-2" value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Founded Year</label>
                  <input type="number" className="w-full border rounded p-2" value={form.founded_year} onChange={e => setForm({...form, founded_year: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Contact Email</label>
                  <input type="email" className="w-full border rounded p-2" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Contact Phone</label>
                  <input type="text" className="w-full border rounded p-2" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Rating (1-5)</label>
                <input type="number" step="0.1" min="1" max="5" className="w-full border rounded p-2" value={form.rating} onChange={e => setForm({...form, rating: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea className="w-full border rounded p-2" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
