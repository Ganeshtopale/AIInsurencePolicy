import { useState } from 'react'
import { useAuthStore } from '@/store'
import { authApi } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'

export default function ChangePassword() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (!user) return <div className="min-h-screen pt-24 flex items-center justify-center"><p className="text-gray-500">Please log in</p></div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await authApi.changePassword({ current_password: current, new_password: newPass })
      setMessage(res.message)
      setCurrent('')
      setNewPass('')
    } catch (err: any) {
      setMessage(err?.response?.data?.detail || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto max-w-lg px-4 py-8">
        <button onClick={() => navigate('/profile')} className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </button>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-xl font-bold text-gray-900">Change Password</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type={show ? 'text' : 'password'} value={current} onChange={(e) => setCurrent(e.target.value)} required
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-blue-400" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type={show ? 'text' : 'password'} value={newPass} onChange={(e) => setNewPass(e.target.value)} required minLength={8}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-blue-400" />
              </div>
              <p className="mt-1 text-xs text-gray-400">Minimum 8 characters</p>
            </div>
            {message && (
              <div className={`rounded-lg p-3 text-sm ${message.includes('success') || message.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-70">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
