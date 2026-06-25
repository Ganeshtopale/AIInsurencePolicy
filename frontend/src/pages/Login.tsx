import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Mail,
  Lock,
  Phone,
  User,
  Eye,
  EyeOff,
  Facebook,
  Chrome,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import clsx from 'clsx';
import { useGoogleLogin } from '@react-oauth/google';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store';

type Tab = 'login' | 'register' | 'admin';

export default function Login() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regError, setRegError] = useState('');

  const loginStore = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ email: loginEmail, password: loginPassword });
      loginStore(res.user, res.access_token);
      window.location.href = redirectTo;
    } catch (err: any) {
      setLoginError(err?.response?.data?.detail || err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const googleLoginAction = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        setLoading(true);
        setLoginError('');
        // Get user info from Google's userinfo endpoint
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${credentialResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        const res = await authApi.googleLogin({
          email: userInfo.email,
          name: userInfo.name,
          google_id: userInfo.sub,
        });
        loginStore(res.user, res.access_token);
        window.location.href = redirectTo;
      } catch {
        setLoginError('Google login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setLoginError('Google login failed');
    },
    flow: 'implicit',
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (!adminUsername || !adminPassword) {
      setAdminError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.adminLogin({ username: adminUsername, password: adminPassword });
      loginStore(res.user, res.access_token);
      window.location.href = '/admin';
    } catch (err: any) {
      setAdminError(err?.response?.data?.detail || err?.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName || !regEmail || !regPhone || !regPassword) {
      setRegError('Please fill in all fields');
      return;
    }
    if (!/^\d{10}$/.test(regPhone)) {
      setRegError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!agreeTerms) {
      setRegError('Please agree to the terms and conditions');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({ name: regName, email: regEmail, password: regPassword, phone: regPhone });
      loginStore(res.user, res.access_token);
      window.location.href = redirectTo;
    } catch (err: any) {
      setRegError(err?.response?.data?.detail || err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PolicyBazaar AI</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">India's most trusted insurance marketplace</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-8 shadow-xl"
          >
            <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
              {(['login', 'register', 'admin'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setLoginError(''); setRegError(''); setAdminError(''); }}
                  className={clsx(
                    'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
                    tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  {t === 'login' ? 'Login' : t === 'register' ? 'Register' : 'Admin Login'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === 'login' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'} value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-gray-600">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700">Forgot password?</Link>
                  </div>

                  {loginError && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4" /> {loginError}
                    </div>
                  )}

                  <button
                    type="submit" disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                    <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">Or continue with</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => googleLoginAction()} disabled={loading} className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                      <Chrome className="h-4 w-4 text-red-500" /> Google
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                      <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                    </button>
                  </div>

                  <p className="text-center text-xs text-gray-400">
                    By signing in, you agree to our{' '}
                    <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                    <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </p>
                </motion.form>
              )}

              {tab === 'admin' && (
                <motion.form
                  key="admin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleAdminLogin}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Username</label>
                    <div className="relative">
                      <ShieldAlert className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'} value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {adminError && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4" /> {adminError}
                    </div>
                  )}

                  <button
                    type="submit" disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-800 py-3 font-semibold text-white transition hover:bg-gray-900 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                    {loading ? 'Signing in...' : 'Admin Sign In'}
                  </button>
                </motion.form>
              )}

              {tab === 'register' && (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text" value={regName} onChange={(e) => setRegName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} maxLength={10}
                        placeholder="9876543210"
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'} value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Minimum 8 characters with a number and letter</p>
                  </div>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-600">
                      I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>,{' '}
                      <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>, and{' '}
                      <a href="#" className="text-blue-600 hover:underline">Telecommunication Policy</a>.
                      I consent to receive communications via call/SMS/email.
                    </span>
                  </label>

                  {regError && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4" /> {regError}
                    </div>
                  )}

                  <button
                    type="submit" disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setTab('login')} className="font-medium text-blue-600 hover:text-blue-700">
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> 256-bit SSL</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> IRDAI Registered</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Data Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
