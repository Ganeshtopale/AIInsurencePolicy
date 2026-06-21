import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuthStore } from '@/store'
import { authApi } from '@/services/api'

const Home = lazy(() => import('@/pages/Home'))
const Chat = lazy(() => import('@/pages/Chat'))
const Compare = lazy(() => import('@/pages/Compare'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Leads = lazy(() => import('@/pages/Leads'))
const Policies = lazy(() => import('@/pages/Policies'))
const Login = lazy(() => import('@/pages/Login'))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))
const AdminUsers = lazy(() => import('@/pages/AdminUsers'))
const AdminPolicies = lazy(() => import('@/pages/AdminPolicies'))
const AdminJobs = lazy(() => import('@/pages/AdminJobs'))
const AdminJobApplications = lazy(() => import('@/pages/AdminJobApplications'))
const AdminProviders = lazy(() => import('@/pages/AdminProviders'))
const AgentChat = lazy(() => import('@/pages/AgentChat'))
const AgentDashboard = lazy(() => import('@/pages/AgentDashboard'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const EditProfile = lazy(() => import('@/pages/EditProfile'))
const ChangePassword = lazy(() => import('@/pages/ChangePassword'))
const PurchaseHistory = lazy(() => import('@/pages/PurchaseHistory'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const About = lazy(() => import('@/pages/About'))
const Blog = lazy(() => import('@/pages/Blog'))
const Careers = lazy(() => import('@/pages/Careers'))
const Partner = lazy(() => import('@/pages/Partner'))
const Press = lazy(() => import('@/pages/Press'))
const Sitemap = lazy(() => import('@/pages/Sitemap'))
const Contact = lazy(() => import('@/pages/Contact'))
const Grievance = lazy(() => import('@/pages/Grievance'))
const Claims = lazy(() => import('@/pages/Claims'))
const FAQ = lazy(() => import('@/pages/FAQ'))
const Privacy = lazy(() => import('@/pages/Privacy'))
const Terms = lazy(() => import('@/pages/Terms'))

function App() {
  const { token, isAuthenticated, setUser } = useAuthStore()

  useEffect(() => {
    if (token && isAuthenticated) {
      authApi.getProfile().then(setUser).catch(() => {})
    }
  }, [])

  return (
    <GoogleOAuthProvider clientId="575376331062-nk92kuflc24sh9crtfb1kdtp5fg19br6.apps.googleusercontent.com">
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/profile/change-password" element={<ChangePassword />} />
              <Route path="/profile/purchases" element={<PurchaseHistory />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/policies" element={<AdminPolicies />} />
              <Route path="/admin/jobs" element={<AdminJobs />} />
              <Route path="/admin/job-applications" element={<AdminJobApplications />} />
              <Route path="/admin/providers" element={<AdminProviders />} />
              <Route path="/agent/chat" element={<AgentChat />} />
              <Route path="/agent" element={<AgentDashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/partner" element={<Partner />} />
              <Route path="/press" element={<Press />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/grievance" element={<Grievance />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  )
}

export default App
