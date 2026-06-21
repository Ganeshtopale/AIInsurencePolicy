import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  Shield,
  Heart,
  TrendingUp,
  Car,
  Bike,
  Plane,
  Building2,
  Users,
  ChevronRight,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Calculator,
  Star,
} from 'lucide-react'
import clsx from 'clsx'

interface InsuranceCategory {
  icon: React.ElementType
  title: string
  description: string
  discount: string
  color: string
  href: string
}

interface HeroSectionProps {
  title?: string
  subtitle?: string
  showSearch?: boolean
  showCategories?: boolean
  showTrustBadges?: boolean
  className?: string
}

const defaultCategories: InsuranceCategory[] = [
  { icon: Shield, title: 'Term Life', description: 'Starting from ₹12/day', discount: 'Up to 40% off', color: 'from-blue-500 to-blue-700', href: '/policies?type=term' },
  { icon: Heart, title: 'Health Insurance', description: 'Cashless hospitalization', discount: 'Up to 25% off', color: 'from-orange-400 to-orange-600', href: '/policies?type=health' },
  { icon: TrendingUp, title: 'Investment Plans', description: 'Grow your wealth', discount: 'Tax benefits', color: 'from-green-500 to-green-700', href: '/policies?type=investment' },
  { icon: Car, title: 'Car Insurance', description: 'Starting ₹2,094/year', discount: 'Up to 35% off', color: 'from-purple-500 to-purple-700', href: '/policies?type=car' },
  { icon: Bike, title: 'Two Wheeler', description: 'Starting ₹594/year', discount: 'Up to 30% off', color: 'from-red-500 to-red-700', href: '/policies?type=bike' },
  { icon: Plane, title: 'Travel Insurance', description: 'International & domestic', discount: 'Up to 20% off', color: 'from-teal-500 to-teal-700', href: '/policies?type=travel' },
  { icon: Building2, title: 'Group Insurance', description: 'For businesses & teams', discount: 'Custom plans', color: 'from-indigo-500 to-indigo-700', href: '/policies?type=group' },
  { icon: Users, title: 'Senior Citizen', description: 'Coverage up to 75 years', discount: 'Special rates', color: 'from-pink-500 to-pink-700', href: '/policies?type=senior' },
]

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function HeroSection({
  title = "Let's find you the Best Insurance",
  subtitle = 'Compare 50+ insurance plans from India\'s top insurers. Save up to 40% on your premiums with AI-powered recommendations.',
  showSearch = true,
  showCategories = true,
  showTrustBadges = true,
  className,
}: HeroSectionProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/policies?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <section className={clsx('relative overflow-hidden bg-gradient-to-br from-insurance-blue-600 via-insurance-blue-700 to-insurance-blue-900 text-white', className)}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-insurance-orange-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-insurance-orange-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-insurance-blue-500/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 75% 20%, #f97316 0%, transparent 50%)' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:pt-28 lg:pb-24">
        <motion.div initial="initial" animate="animate" variants={stagger} className="text-center">
          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-orange-200 mb-6 border border-white/10">
            <Sparkles className="h-4 w-4 text-insurance-orange-400" />
            AI-Powered Insurance Advisor
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={fadeInUp} className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
            {title.split('Best Insurance').length > 1 ? (
              <>
                {title.split('Best Insurance')[0]}
                <span className="text-insurance-orange-400">Best Insurance</span>
              </>
            ) : (
              title
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeInUp} className="mx-auto mt-4 max-w-2xl text-lg text-blue-100/90 sm:text-xl">
            {subtitle}
          </motion.p>

          {/* Stats row */}
          <motion.div variants={fadeInUp} className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-insurance-orange-400" /> 51+ Insurers</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-insurance-orange-400" /> 4.8★ Rating</span>
            <span className="flex items-center gap-1.5"><Calculator className="h-4 w-4 text-insurance-orange-400" /> Save up to 40%</span>
          </motion.div>

          {/* Search / Quick Quote Form */}
          {showSearch && (
            <motion.form
              variants={fadeInUp}
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-2xl rounded-xl bg-white p-1.5 shadow-2xl"
            >
              <div className="flex flex-1 items-center gap-2 px-4">
                <Search className="h-5 w-5 shrink-0 text-insurance-dark-400" />
                <input
                  type="text"
                  placeholder="Search insurance plans, policies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-0 bg-transparent text-insurance-dark-900 placeholder-insurance-dark-400 outline-none focus:ring-0 text-sm"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-insurance-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-insurance-orange-600 focus:outline-none focus:ring-2 focus:ring-insurance-orange-400 focus:ring-offset-2"
              >
                <Search className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Search</span>
                <ArrowRight className="h-4 w-4 hidden sm:block" />
              </button>
            </motion.form>
          )}

          {/* Quick links under search */}
          <motion.div variants={fadeInUp} className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="text-blue-200/70">Popular:</span>
            {['Term Life', 'Health Insurance', 'Car Insurance', 'Travel'].map((item) => (
              <button
                key={item}
                onClick={() => navigate(`/policies?q=${encodeURIComponent(item)}`)}
                className="rounded-full bg-white/10 backdrop-blur-sm px-3.5 py-1 text-xs font-medium text-blue-100 hover:bg-white/20 transition-colors border border-white/10"
              >
                {item}
              </button>
            ))}
          </motion.div>

          {/* Trust Badges */}
          {showTrustBadges && (
            <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200/80">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-insurance-orange-400" /> IRDAI Registered</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-insurance-orange-400" /> 9M+ Customers</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-insurance-orange-400" /> 100% Paperless</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-insurance-orange-400" /> Instant e-Policy</span>
            </motion.div>
          )}
        </motion.div>

        {/* Insurance Category Cards */}
        {showCategories && (
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {defaultCategories.slice(0, 8).map((cat) => (
              <motion.button
                key={cat.title}
                variants={scaleIn}
                onClick={() => navigate(cat.href)}
                className="group relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm p-5 text-left transition-all hover:bg-white/20 hover:-translate-y-1 border border-white/10"
              >
                <div className={clsx('mb-3 inline-flex rounded-lg bg-gradient-to-br p-2.5 text-white', cat.color)}>
                  <cat.icon className="h-5 w-5" />
                </div>
                {cat.discount && (
                  <span className="absolute right-3 top-3 rounded-full bg-insurance-orange-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {cat.discount}
                  </span>
                )}
                <h3 className="text-sm font-semibold text-white">{cat.title}</h3>
                <p className="mt-0.5 text-xs text-blue-200/70">{cat.description}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-insurance-orange-300 opacity-0 transition-opacity group-hover:opacity-100">
                  Compare Plans <ChevronRight className="h-3 w-3" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
    </section>
  )
}
