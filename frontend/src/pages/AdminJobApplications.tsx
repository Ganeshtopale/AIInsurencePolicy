import { useState, useEffect, useCallback } from 'react'
import { adminApi, JobApplication } from '@/services/api'
import { useAuthStore } from '@/store'
import { Search, Eye, Download, Mail, Phone, XCircle } from 'lucide-react'
import ApplicationStatusStepper from '@/components/ApplicationStatusStepper'

type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired' | 'interview'

export default function AdminJobApplications() {
  const { user } = useAuthStore()
  const [apps, setApps] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<JobApplication | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    adminApi
     .listJobApplications()
     .then(setApps)
     .catch((err) => {
        console.error('Failed to load applications:', err)
        setApps([])
      })
     .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (id: number, status: ApplicationStatus) => {
    try {
      setUpdatingId(id)
      await adminApi.updateApplicationStatus(id, status)
      setApps((prev) => prev.map((app) => (app.id === id? {...app, status } : app)))
      if (selected?.id === id) setSelected((prev) => (prev? {...prev, status } : null))
    } catch (err) {
      console.error('Failed to update status:', err)
      // Optional: add toast here
      alert('Failed to update status. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    if (selected) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selected])

  if (user?.role!== 'admin') return <div className="p-8 text-center text-red-500">Access denied</div>

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.job_title || '').toLowerCase().includes(search.toLowerCase())
  )

  const statusColors: Record<ApplicationStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    shortlisted: 'bg-purple-100 text-purple-800',
    interview: 'bg-indigo-100 text-indigo-800',
    rejected: 'bg-red-100 text-red-800',
    hired: 'bg-green-100 text-green-800',
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              aria-label="Search applications"
            />
          </div>
        </div>

        {loading? (
          <div className="py-12 text-center text-gray-500">Loading applications...</div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Position</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((a) => (
                    <tr
                      key={a.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelected(a)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                      <td className="px-4 py-3 text-gray-600">{a.job_title || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{a.email}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {a.created_at
                         ? new Date(a.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            statusColors[a.status as ApplicationStatus] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelected(a)
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label={`View ${a.name}'s application`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="py-8 text-center text-gray-400">
                  {search? 'No applications match your search.' : 'No applications found.'}
                </p>
              )}
            </div>

            {/* Detail Modal */}
            {selected && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                onClick={() => setSelected(null)}
              >
                <div
                  className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
                    <h2 className="text-lg font-bold text-gray-900">Application Details</h2>
                    <button
                      onClick={() => setSelected(null)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="Close modal"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4 p-6">
                    <div>
                      <p className="text-sm text-gray-400">Position</p>
                      <p className="font-medium text-gray-900">{selected.job_title || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="font-medium text-gray-900">{selected.name}</p>
                    </div>
                    <div className="flex flex-wrap items-start gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <a
                          href={`mailto:${selected.email}`}
                          className="flex items-center gap-1 font-medium text-blue-600 hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" /> {selected.email}
                        </a>
                      </div>
                      {selected.phone && (
                        <div>
                          <p className="text-sm text-gray-400">Phone</p>
                          <a
                            href={`tel:${selected.phone}`}
                            className="flex items-center gap-1 font-medium text-gray-900 hover:text-blue-600"
                          >
                            <Phone className="h-3.5 w-3.5" /> {selected.phone}
                          </a>
                        </div>
                      )}
                    </div>
                    {selected.resume_url && (
                      <div>
                        <p className="mb-1 text-sm text-gray-400">Resume</p>
                        <a
                          href={selected.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100"
                        >
                          <Download className="h-4 w-4" /> Download Resume
                        </a>
                      </div>
                    )}
                    {selected.cover_letter && (
                      <div>
                        <p className="mb-1 text-sm text-gray-400">Cover Letter</p>
                        <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                          {selected.cover_letter}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="mb-3 text-sm text-gray-400">Application Progress</p>
                      <ApplicationStatusStepper
                        status={selected.status}
                        interactive={true}
                        onUpdate={(s) => updateStatus(selected.id, s)}
                        updating={updatingId === selected.id}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Applied</p>
                      <p className="text-sm text-gray-600">
                        {selected.created_at
                         ? new Date(selected.created_at).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

