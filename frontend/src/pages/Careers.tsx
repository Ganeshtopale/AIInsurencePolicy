import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, ArrowRight, X, Upload, Loader2, CheckCircle, AlertCircle, Briefcase, FileText, LogIn } from 'lucide-react'
import { jobApi, Job } from '@/services/api'
import { useAuthStore } from '@/store'

export default function Careers() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showApply, setShowApply] = useState<Job | null>(null)
  const [showGeneral, setShowGeneral] = useState(false)
  const [showDetails, setShowDetails] = useState<Job | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', cover_letter: '' })
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  const requireAuth = (job: Job, action: 'apply' | 'details') => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }
    if (action === 'apply') {
      setShowApply(job); setSuccess(false); setError('')
    } else {
      setShowDetails(job)
    }
  }

  useEffect(() => {
    jobApi.listJobs().then(setJobs).catch(() => setJobs([])).finally(() => setLoading(false))
  }, [])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) { setError('Name and email are required'); return }
    setSubmitting(true); setError('')
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('email', form.email)
      fd.append('phone', form.phone)
      fd.append('cover_letter', form.cover_letter)
      if (resumeFile) fd.append('resume', resumeFile)
      await jobApi.apply(showApply!.id, fd)
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', cover_letter: '' })
      setResumeFile(null)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit application')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Join Our Team</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Help us revolutionize the insurance industry with AI. We're looking for passionate individuals
            who want to make a difference.
          </p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-600">{jobs.length > 0 ? `${jobs.length}` : '200+'}</p>
            <p className="text-gray-600">Open Positions</p>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-600">4 Cities</p>
            <p className="text-gray-600">Offices Across India</p>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-600">50+</p>
            <p className="text-gray-600">Insurance Partners</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg text-gray-500">No open positions right now. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.department}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.type}</span>
                  </div>
                  {job.description && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{job.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => requireAuth(job, 'details')}
                    className="flex items-center gap-1 rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                  >
                    <FileText className="h-4 w-4" /> Job Details
                  </button>
                  <button
                    onClick={() => requireAuth(job, 'apply')}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Apply <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-xl bg-gradient-to-r from-blue-600 to-orange-500 p-8 text-center text-white">
          <h2 className="mb-2 text-2xl font-bold">Don't see the right role?</h2>
          <p className="mb-4">Send us your resume and we'll keep you in mind for future openings.</p>
          <button
            onClick={() => { if (!isAuthenticated) { setShowLoginPrompt(true); return } setShowGeneral(true); setSuccess(false); setError(''); setShowApply(null); }}
            className="rounded-lg bg-white px-6 py-2.5 font-semibold text-blue-600 transition hover:bg-gray-100"
          >
            Submit Resume
          </button>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
              <LogIn className="h-7 w-7 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-sm text-gray-500 mb-6">Please login or create an account to apply for jobs.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLoginPrompt(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={() => navigate('/login?redirect=/careers')}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
                Login / Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{showDetails.title}</h2>
                <p className="text-sm text-gray-500">{showDetails.department} - {showDetails.location}</p>
              </div>
              <button onClick={() => setShowDetails(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{showDetails.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{showDetails.type}</span>
              </div>

              {showDetails.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{showDetails.description}</p>
                </div>
              )}

              {showDetails.requirements && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{showDetails.requirements}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowApply(showDetails); setShowDetails(null); setSuccess(false); setError(''); }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  Apply Now <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => setShowDetails(null)}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {(showApply || showGeneral) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {showGeneral ? 'General Application' : `Apply: ${showApply!.title}`}
                </h2>
                {showApply && <p className="text-sm text-gray-500">{showApply.department} - {showApply.location}</p>}
              </div>
              <button onClick={() => { setShowApply(null); setShowGeneral(false); }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-500 mb-4">We'll review your application and get back to you within 5-7 business days.</p>
                <button onClick={() => { setShowApply(null); setShowGeneral(false); }}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF/DOC)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
                      <Upload className="h-4 w-4" />
                      {resumeFile ? resumeFile.name : 'Upload Resume'}
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
                    </label>
                    {resumeFile && <button type="button" onClick={() => setResumeFile(null)}
                      className="text-xs text-red-500 hover:underline">Remove</button>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                  <textarea rows={4} value={form.cover_letter} onChange={(e) => setForm({ ...form, cover_letter: e.target.value })}
                    placeholder="Tell us why you're a great fit..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowApply(null); setShowGeneral(false); }}
                    className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 transition">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}