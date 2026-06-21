import { useState, useEffect, useCallback } from 'react'
import { adminApi, jobApi, Job } from '@/services/api'
import { useAuthStore } from '@/store'
import { Plus, X, Edit3, Loader2, AlertCircle, CheckCircle, MapPin, Clock } from 'lucide-react'

type JobType = 'Full-time' | 'Part-time' | 'Remote' | 'Hybrid' | 'Contract'

interface JobForm {
  title: string
  department: string
  location: string
  type: JobType
  description: string
  requirements: string
}

const initialForm: JobForm = {
  title: '',
  department: '',
  location: '',
  type: 'Full-time',
  description: '',
  requirements: '',
}

export default function AdminJobs() {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Job | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState<JobForm>(initialForm)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    adminApi
    .listJobs()
    .then(setJobs)
    .catch((err) => {
        console.error('Failed to load jobs:', err)
        setJobs([])
      })
    .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Close modal on Escape + body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowForm(false)
    }
    if (showForm) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [showForm])

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const openEdit = (job: Job) => {
    setEditing(job)
    setForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type as JobType,
      description: job.description || '',
      requirements: job.requirements || '',
    })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditing(null)
    setForm(initialForm)
    setError('')
    setSuccess('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() ||!form.department.trim() ||!form.location.trim()) {
      setError('Title, department, and location are required')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      if (editing) {
        await jobApi.updateJob(editing.id, form)
        setSuccess('Job updated successfully')
      } else {
        await jobApi.createJob(form)
        setSuccess('Job created successfully')
        setForm(initialForm)
      }
      load()
      setTimeout(() => handleCloseForm(), 1000)
    } catch (err: any) {
      console.error('Save failed:', err)
      setError(err?.response?.data?.detail || 'Failed to save job. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (job: Job) => {
    try {
      setTogglingId(job.id)
      await jobApi.updateJob(job.id, { is_active: !job.is_active })
      load()
    } catch (err) {
      console.error('Failed to toggle job status:', err)
      alert('Failed to update job status. Please try again.')
    } finally {
      setTogglingId(null)
    }
  }

  if (user?.role!== 'admin') return <div className="p-8 text-center text-red-500">Access denied</div>

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900"
          >
            <Plus className="h-4 w-4" /> Add Job
          </button>
        </div>

        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleCloseForm}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
                <h2 className="text-lg font-bold text-gray-900">{editing? 'Edit Job' : 'Add New Job'}</h2>
                <button
                  onClick={handleCloseForm}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
                      Job Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({...form, title: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="e.g. Senior Frontend Engineer"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="mb-1 block text-sm font-medium text-gray-700">
                      Department *
                    </label>
                    <input
                      id="department"
                      type="text"
                      value={form.department}
                      onChange={(e) => setForm({...form, department: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="e.g. Engineering"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="mb-1 block text-sm font-medium text-gray-700">
                      Location *
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({...form, location: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="e.g. Bangalore, Remote"
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      id="type"
                      value={form.type}
                      onChange={(e) => setForm({...form, type: e.target.value as JobType })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Remote</option>
                      <option>Hybrid</option>
                      <option>Contract</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="requirements" className="mb-1 block text-sm font-medium text-gray-700">
                      Requirements
                    </label>
                    <input
                      id="requirements"
                      type="text"
                      value={form.requirements}
                      onChange={(e) => setForm({...form, requirements: e.target.value })}
                      placeholder="e.g. 3+ years experience"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Describe the role, responsibilities, and benefits..."
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4 shrink-0" /> {success}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-800 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving? <Loader2 className="h-4 w-4 animate-spin" /> : editing? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading? (
          <div className="py-12 text-center text-gray-500">Loading jobs...</div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.department}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {job.type}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      job.is_active? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {job.is_active? 'Active' : 'Closed'}
                  </span>
                  <button
                    onClick={() => openEdit(job)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label={`Edit ${job.title}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(job)}
                    disabled={togglingId === job.id}
                    className={`rounded px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      job.is_active
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {togglingId === job.id? '...' : job.is_active? 'Close' : 'Open'}
                  </button>
                </div>
              </div>
            ))}
            {jobs.length === 0 && <p className="py-8 text-center text-gray-400">No jobs posted yet.</p>}
          </div>
        )}
      </div>
    </div>
  )
}


