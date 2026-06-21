import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  ChevronDown,
  Phone,
  Menu,
  X,
  Heart,
  TrendingUp,
  Car,
  Bike,
  Plane,
  Building2,
  Users,
  FileText,
  Headphones,
  LogIn,
  User,
  ClipboardCheck,
  LifeBuoy,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Key,
  Briefcase,
  ClipboardList,
  MessageSquare,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from '@/store'

const insuranceTypes = [
  { icon: Heart, label: 'Health Insurance', href: '/policies?type=health', desc: 'Cashless hospitalization' },
  { icon: Shield, label: 'Term Life Insurance', href: '/policies?type=term', desc: 'Secure your family\'s future' },
  { icon: TrendingUp, label: 'Investment Plans', href: '/policies?type=investment', desc: 'Grow your wealth' },
  { icon: Car, label: 'Car Insurance', href: '/policies?type=car', desc: 'Starting ₹2,094/year' },
  { icon: Bike, label: 'Two Wheeler', href: '/policies?type=bike', desc: 'Starting ₹594/year' },
  { icon: Plane, label: 'Travel Insurance', href: '/policies?type=travel', desc: 'International & domestic' },
  { icon: Building2, label: 'Group Insurance', href: '/policies?type=group', desc: 'For businesses & teams' },
  { icon: Users, label: 'Senior Citizen', href: '/policies?type=senior', desc: 'Coverage up to 75 years' },
]

const navLinks = [
  {
    label: 'Insurance Products',
    dropdown: insuranceTypes,
  },
  { label: 'Renew', icon: FileText, href: '/renew' },
  { label: 'Claim', icon: ClipboardCheck, href: '/claim' },
  { label: 'Support', icon: Headphones, href: '/support' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
    setIsDropdownOpen(false)
    setIsUserMenuOpen(false)
  }, [location])

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-white'
      )}
    >
      {/* Top bar - phone */}
      <div className="hidden lg:flex items-center justify-end gap-6 bg-insurance-blue-900 px-6 py-1.5 text-xs text-white/80">
        <span className="flex items-center gap-1.5">
          <LifeBuoy className="h-3.5 w-3.5" />
          Need help? Talk to our experts
        </span>
        <a href="tel:8669065575" className="flex items-center gap-1.5 font-semibold text-white hover:text-insurance-orange-400 transition-colors">
          <Phone className="h-3.5 w-3.5" />
          8669065575
        </a>
      </div>

      {/* Main nav */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-insurance-orange-500 to-insurance-orange-600 shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-insurance-dark-900 tracking-tight">
                Insurance<span className="text-insurance-orange-500">Bazaar</span>
              </span>
              <span className="text-[10px] font-medium text-insurance-dark-400 -mt-0.5">India's Insurance Advisor</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <button className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-insurance-dark-700 hover:text-insurance-orange-600 hover:bg-insurance-orange-50 transition-colors">
                    {link.label}
                    <ChevronDown className={clsx('h-4 w-4 transition-transform duration-200', isDropdownOpen && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-full left-0 mt-1 w-72 rounded-xl bg-white shadow-xl border border-insurance-dark-100 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-1 p-2">
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.label}
                              to={item.href}
                              className="flex items-start gap-3 rounded-lg p-3 hover:bg-insurance-orange-50 transition-colors group"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-insurance-orange-100 text-insurance-orange-600 group-hover:bg-insurance-orange-200 transition-colors">
                                <item.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-insurance-dark-800">{item.label}</div>
                                <div className="text-[11px] text-insurance-dark-400">{item.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.href!}
                  className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-insurance-dark-700 hover:text-insurance-orange-600 hover:bg-insurance-orange-50 transition-colors"
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="tel:8669065575"
              className="hidden sm:flex items-center gap-2 rounded-lg border border-insurance-dark-200 px-3.5 py-2 text-sm font-medium text-insurance-orange-600 hover:bg-insurance-orange-50 transition-colors lg:hidden"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">8669065575</span>
            </a>

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-1.5 rounded-lg border border-insurance-dark-200 px-3.5 py-2 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-lg border border-insurance-dark-200 px-3 py-2 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-insurance-orange-100 text-insurance-orange-600">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform', isUserMenuOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 top-full mt-1 w-56 rounded-xl bg-white shadow-xl border border-insurance-dark-100 overflow-hidden"
                    >
                      <div className="p-2 space-y-0.5">
                        <Link to="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors">
                          <User className="h-4 w-4" /> My Profile
                        </Link>
                        <Link to="/profile/purchases" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors">
                          <ShoppingBag className="h-4 w-4" /> My Purchases
                        </Link>
                        <Link to="/profile/change-password" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors">
                          <Key className="h-4 w-4" /> Change Password
                        </Link>
                        {(user.role === 'admin' || user.role === 'agent') && (
                          <>
                            <div className="my-1 border-t border-insurance-dark-100" />
                            <Link to="/agent" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors">
                              <LayoutDashboard className="h-4 w-4" /> Agent Dashboard
                            </Link>
                            <Link to="/agent/chat" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors">
                              <MessageSquare className="h-4 w-4" /> Agent Chat
                            </Link>
                          </>
                        )}
                        {(user.role === 'admin' || user.role === 'agent') && (
                          <>
                            <Link to="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors">
                              <LayoutDashboard className="h-4 w-4" /> Dashboard
                            </Link>
                            <Link to="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors">
                              <Users className="h-4 w-4" /> Manage Users
                            </Link>
                            <Link to="/admin/policies" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors">
                              <FileText className="h-4 w-4" /> Manage Policies
                            </Link>
                            <Link to="/admin/providers" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors">
                              <Building2 className="h-4 w-4" /> Providers
                            </Link>
                            <Link to="/admin/jobs" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors">
                              <Briefcase className="h-4 w-4" /> Jobs
                            </Link>
                            <Link to="/admin/job-applications" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-orange-50 transition-colors">
                              <ClipboardList className="h-4 w-4" /> Applications
                            </Link>
                          </>
                        )}
                        <div className="my-1 border-t border-insurance-dark-100" />
                        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-insurance-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-insurance-orange-600 transition-colors shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="sm:hidden flex items-center justify-center h-9 w-9 rounded-lg text-insurance-dark-600 hover:bg-insurance-dark-100 transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg text-insurance-dark-600 hover:bg-insurance-dark-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden border-t border-insurance-dark-100 bg-white"
          >
            <div className="px-4 py-4 space-y-1">
              {isAuthenticated && user && (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-insurance-orange-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-insurance-orange-200 text-insurance-orange-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-insurance-dark-900">{user.name}</p>
                    <p className="text-xs text-insurance-dark-400">{user.email}</p>
                  </div>
                </div>
              )}

              <div className="mb-3 px-3 py-2 text-xs font-semibold text-insurance-dark-400 uppercase tracking-wider">
                Insurance Products
              </div>
              <div className="grid grid-cols-2 gap-1 mb-4">
                {insuranceTypes.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-start gap-3 rounded-lg p-3 hover:bg-insurance-orange-50 transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-insurance-orange-100 text-insurance-orange-600">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-insurance-dark-800">{item.label}</div>
                      <div className="text-[11px] text-insurance-dark-400">{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="border-t border-insurance-dark-100 pt-3 space-y-1">
                {navLinks.filter(l => !l.dropdown).map((link) => (
                  <Link
                    key={link.label}
                    to={link.href!}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-dark-100 transition-colors"
                  >
                    {link.icon && <link.icon className="h-4 w-4 text-insurance-dark-400" />}
                    {link.label}
                  </Link>
                ))}
              </div>

              {isAuthenticated && user && (
                <div className="border-t border-insurance-dark-100 pt-3 space-y-1">
                  <Link to="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-dark-100 transition-colors">
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                  <Link to="/profile/purchases" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-dark-100 transition-colors">
                    <ShoppingBag className="h-4 w-4" /> My Purchases
                  </Link>
                  {(user.role === 'admin' || user.role === 'agent') && (
                    <>
                      <Link to="/agent" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-dark-100 transition-colors">
                        <LayoutDashboard className="h-4 w-4" /> Agent Dashboard
                      </Link>
                      <Link to="/agent/chat" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-dark-100 transition-colors">
                        <MessageSquare className="h-4 w-4" /> Agent Chat
                      </Link>
                    </>
                  )}
                  {(user.role === 'admin' || user.role === 'agent') && (
                    <>
                      <Link to="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-dark-100 transition-colors">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link to="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-dark-100 transition-colors">
                        <Users className="h-4 w-4" /> Manage Users
                      </Link>
                      <Link to="/admin/policies" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-dark-100 transition-colors">
                        <FileText className="h-4 w-4" /> Manage Policies
                      </Link>
                      <Link to="/admin/providers" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-dark-100 transition-colors">
                        <Building2 className="h-4 w-4" /> Providers
                      </Link>
                      <Link to="/admin/jobs" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-dark-100 transition-colors">
                        <Briefcase className="h-4 w-4" /> Jobs
                      </Link>
                      <Link to="/admin/job-applications" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-insurance-dark-700 hover:bg-insurance-dark-100 transition-colors">
                        <ClipboardList className="h-4 w-4" /> Applications
                      </Link>
                    </>
                  )}
                  <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}

              <div className="border-t border-insurance-dark-100 pt-4 mt-4 space-y-3">
                <a
                  href="tel:8669065575"
                  className="flex items-center justify-center gap-2 rounded-lg border border-insurance-dark-200 px-4 py-2.5 text-sm font-semibold text-insurance-orange-600"
                >
                  <Phone className="h-4 w-4" />
                  8669065575
                </a>
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 rounded-lg bg-insurance-orange-500 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
