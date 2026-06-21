import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader2, ArrowLeft, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { authApi } from '@/services/api'
import { Link } from 'react-router-dom'

type Step = 'email' | 'otp'

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPass, setNewPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.forgotPassword({ email })
      setMessage(res.message)
      setStep('otp')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const resetPass = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.resetPassword({ email, otp, new_password: newPass })
      setMessage(res.message)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PolicyBazaar AI</span>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-8 shadow-xl">
          <Link to="/login" className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>

          {message && !error && step === 'otp' ? (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" /> {message}
            </div>
          ) : null}

          {step === 'email' ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <h1 className="text-xl font-bold text-gray-900">Forgot Password</h1>
              <p className="text-sm text-gray-500">Enter your email to receive an OTP</p>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
              {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4" /> {error}</div>}
              <button type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-70">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPass} className="space-y-4">
              <h1 className="text-xl font-bold text-gray-900">Reset Password</h1>
              <p className="text-sm text-gray-500">Enter the OTP sent to {email}</p>
              <div>
                <label className="block text-sm font-medium text-gray-700">OTP</label>
                <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6}
                  className="mt-1 w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm text-center text-lg tracking-widest outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)} minLength={8}
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
              {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4" /> {error}</div>}
              {message && !error && <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700"><CheckCircle className="h-4 w-4" /> {message}</div>}
              <button type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-70">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
