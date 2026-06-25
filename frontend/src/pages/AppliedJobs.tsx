import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jobApi, JobApplication } from '@/services/api'
import { useAuthStore } from '@/store'
import { Briefcase, ChevronRight, Loader2 } from 'lucide-react'
import ApplicationStatusStepper from '@/components/ApplicationStatusStepper'

export default function AppliedJobs() {
  const { user } = useAuthStore()
  const [apps, setApps] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobApi.getMyApplications()
      .then(setApps)
      .catch(() => setApps([]))
      .finally(() => setLoading(false))
  }, [])

  if (!user) return <div className="min-h-screen pt-24 flex items-center justify-center"><p className="text-gray-500">Please log in</p></div>

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Applied Jobs</h1>
          <p className="text-sm text-gray-500">Track the status of your job applications</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : apps.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg text-gray-500 mb-2">No applications yet</p>
            <p className="text-sm text-gray-400 mb-4">Browse open positions and apply to track your status here.</p>
            <Link to="/careers" className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition">
              View Open Positions <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((app) => (
              <div key={app.id} className="rounded-xl bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{app.job_title || `Job #${app.job_id}`}</h3>
                      {app.department && <p className="text-sm text-gray-500">{app.department}</p>}
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> Applied {app.created_at ? new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                      </div>
                    </div>
                  </div>
                  <ApplicationStatusStepper status={app.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}