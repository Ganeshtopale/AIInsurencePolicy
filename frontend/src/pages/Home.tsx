import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Calculator,
  Star,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Phone,
  Wallet,
  Clock,
  Award,
  Quote,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { homeApi } from '@/services/api';

type CategoryCard = {
  icon: React.ElementType;
  title: string;
  description: string;
  discount: string;
  color: string;
  href: string;
};

type PartnerData = {
  id: number;
  name: string;
  brandColor: string;
};

type CalculatorItemData = {
  id: string;
  title: string;
  description: string;
  link: string;
};

type CalculatorCategoryData = {
  category: string;
  icon: string;
  items: CalculatorItemData[];
};

type Testimonial = {
  name: string;
  location: string;
  text: string;
  rating: number;
  policy: string;
};

const categories: CategoryCard[] = [
  { icon: Shield, title: 'Term Life Insurance', description: 'Starting from ₹12/day', discount: 'Up to 40% off', color: 'from-blue-500 to-blue-700', href: '/policies?type=term' },
  { icon: Heart, title: 'Health Insurance', description: 'Cashless hospitalization', discount: 'Up to 25% off', color: 'from-orange-400 to-orange-600', href: '/policies?type=health' },
  { icon: TrendingUp, title: 'Investment Plans', description: 'Grow your wealth', discount: 'Tax benefits', color: 'from-green-500 to-green-700', href: '/policies?type=investment' },
  { icon: Car, title: 'Car Insurance', description: 'Starting from ₹2,094/year', discount: 'Up to 35% off', color: 'from-purple-500 to-purple-700', href: '/policies?type=car' },
  { icon: Bike, title: 'Two Wheeler Insurance', description: 'Starting from ₹594/year', discount: 'Up to 30% off', color: 'from-red-500 to-red-700', href: '/policies?type=bike' },
  { icon: Plane, title: 'Travel Insurance', description: 'International & domestic', discount: 'Up to 20% off', color: 'from-teal-500 to-teal-700', href: '/policies?type=travel' },
  { icon: Building2, title: 'Group Insurance', description: 'For businesses & teams', discount: 'Custom plans', color: 'from-indigo-500 to-indigo-700', href: '/policies?type=group' },
  { icon: Users, title: 'Senior Citizen Plans', description: 'Coverage up to 75 years', discount: 'Special rates', color: 'from-pink-500 to-pink-700', href: '/policies?type=senior' },
];

const categoryIconMap: Record<string, React.ElementType> = {
  Investment: TrendingUp,
  'Health & Wellness': Heart,
  'Term Insurance': Shield,
  'Policy Premium': Wallet,
};

const testimonials: Testimonial[] = [
  { name: 'Rajesh Kumar', location: 'Mumbai, Maharashtra', text: 'I saved ₹12,000 on my term plan compared to buying directly. The AI advisor helped me choose the perfect coverage.', rating: 5, policy: 'Term Life Insurance' },
  { name: 'Priya Sharma', location: 'Delhi, NCR', text: 'The comparison tool made it so easy to pick the right health insurance. My claim was processed within 3 days!', rating: 5, policy: 'Health Insurance' },
  { name: 'Amit Patel', location: 'Ahmedabad, Gujarat', text: 'Best platform for insurance in India. Got my car insurance at 35% cheaper than renewal quote from the insurer.', rating: 5, policy: 'Car Insurance' },
  { name: 'Sneha Reddy', location: 'Bangalore, Karnataka', text: 'The AI chat advisor answered all my questions patiently. Felt like having a personal insurance expert at home.', rating: 5, policy: 'Term Life Insurance' },
];

const stats = [
  { icon: Building2, value: '51+', label: 'Insurers' },
  { icon: Users, value: '9M+', label: 'Happy Customers' },
  { icon: Wallet, value: '₹2,500Cr+', label: 'Claims Settled' },
  { icon: Award, value: '4.8★', label: 'Average Rating' },
];

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [calculators, setCalculators] = useState<CalculatorCategoryData[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loadingHome, setLoadingHome] = useState(true);

  useEffect(() => {
    homeApi.getHomeData()
      .then((data) => {
        setPartners(data.partners);
        setCalculators(data.calculators);
        if (data.calculators.length > 0) {
          setActiveCategory(data.calculators[0].category);
        }
      })
      .catch(() => {
        setPartners([]);
        setCalculators([]);
      })
      .finally(() => setLoadingHome(false));
  }, []);

  const activeCalculatorItems = calculators.find((c) => c.category === activeCategory)?.items ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/policies?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 75% 20%, #f97316 0%, transparent 50%)' }} />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <motion.div initial="initial" animate="animate" variants={stagger} className="text-center">
            <motion.h1 variants={fadeInUp} className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Let's find you the{' '}
              <span className="text-orange-400">Best Insurance</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="mx-auto mt-4 max-w-2xl text-lg text-blue-100 sm:text-xl">
              Compare 50+ insurance plans from India's top insurers. Save up to 40% on your premiums with AI-powered recommendations.
            </motion.p>

            {/* Search Bar */}
            <motion.form variants={fadeInUp} onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-2xl rounded-xl bg-white p-2 shadow-2xl">
              <div className="flex flex-1 items-center gap-2 px-4">
                <Search className="h-5 w-5 shrink-0 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search insurance plans, policies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-0 bg-transparent text-gray-800 placeholder-gray-400 outline-none focus:ring-0"
                />
              </div>
              <button type="submit" className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2">
                Search
              </button>
            </motion.form>

            {/* Trust Badges */}
            <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-orange-400" /> IRDAI Registered</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-orange-400" /> 9M+ Customers</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-orange-400" /> 100% Paperless</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-orange-400" /> Instant e-Policy</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
      </section>

      {/* ── Stats Section ── */}
      <section className="relative -mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-xl sm:grid-cols-4 sm:p-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Insurance Categories ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Insurance Products</h2>
            <p className="mt-3 text-gray-500">Choose from 10,000+ insurance plans across 8 categories</p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {categories.map((cat) => (
              <motion.a
                key={cat.title}
                variants={scaleIn}
                href={cat.href}
                className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={clsx('mb-4 inline-flex rounded-lg bg-gradient-to-br p-3 text-white', cat.color)}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <span className="absolute right-3 top-3 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-600">{cat.discount}</span>
                <h3 className="text-lg font-semibold text-gray-900">{cat.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{cat.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Compare Plans <ChevronRight className="h-4 w-4" />
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Partner Insurers ── */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900">India's Top Insurance Partners</h2>
            <p className="mt-2 text-gray-500">Trusted by 51+ leading insurance companies</p>
          </motion.div>

          {loadingHome ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            >
              {partners.map((p) => (
                <motion.div
                  key={String(p.id)}
                  variants={fadeInUp}
                  className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 grayscale hover:grayscale-0 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="h-1 w-full" style={{ backgroundColor: p.brandColor }} />
                  <div className="flex items-center justify-center p-4 h-20">
                    <span className="text-sm font-bold tracking-wide text-gray-600 transition-colors group-hover:text-gray-900">{p.name}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Why use AI Insurance Advisor?</h2>
              <p className="mt-4 text-gray-500">Our AI-powered platform analyses 50+ data points to recommend the best insurance policy for you and your family.</p>

              <div className="mt-8 space-y-6">
                {[
                  { icon: Clock, title: 'Save Time', desc: 'Compare 50+ plans in 2 minutes instead of days of research' },
                  { icon: Wallet, title: 'Save Money', desc: 'Get premiums up to 40% lower than buying directly from insurers' },
                  { icon: Shield, title: 'Expert Advice', desc: 'AI-powered recommendations tailored to your needs' },
                  { icon: CheckCircle, title: 'Hassle-Free Claims', desc: 'Dedicated support from purchase to claim settlement' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <motion.a
                whileHover={{ scale: 1.02 }}
                href="/chat"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                Talk to AI Advisor <ArrowRight className="h-4 w-4" />
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-blue-50 to-orange-50 p-8 shadow-lg">
                <div className="grid h-full grid-cols-2 gap-4">
                  {[
                    { label: 'Plans Compared', value: '10,000+' },
                    { label: 'Happy Users', value: '9M+' },
                    { label: 'Claim Ratio', value: '95%' },
                    { label: 'Avg. Savings', value: '₹8,500' },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center justify-center rounded-xl bg-white/80 p-4 text-center backdrop-blur">
                      <span className="text-2xl font-bold text-blue-600">{item.value}</span>
                      <span className="mt-1 text-xs text-gray-500">{item.label}</span>
                    </div>
                  ))}
                  <div className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-orange-500 p-4 text-white">
                    <Phone className="h-5 w-5" />
                    <span className="font-semibold">24/7 Claim Support</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Popular Calculators ── */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900">Popular Calculators</h2>
            <p className="mt-3 text-gray-500">Know exactly how much coverage you need</p>
          </motion.div>

          {loadingHome ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Category Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8 flex flex-wrap items-center justify-center gap-3"
              >
                {calculators.map((cat) => {
                  const CatIcon = categoryIconMap[cat.category] ?? Calculator;
                  return (
                    <button
                      key={cat.category}
                      onClick={() => setActiveCategory(cat.category)}
                      className={clsx(
                        'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors',
                        activeCategory === cat.category
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-600 shadow-sm hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <CatIcon className="h-4 w-4" />
                      {cat.category}
                    </button>
                  );
                })}
              </motion.div>

              {/* Calculator Grid */}
              <motion.div
                key={activeCategory}
                initial="initial"
                animate="animate"
                variants={stagger}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
              >
                {activeCalculatorItems.map((item) => {
                  const activeCat = calculators.find((c) => c.category === activeCategory);
                  const ItemIcon = activeCat ? (categoryIconMap[activeCat.category] ?? Calculator) : Calculator;
                  return (
                    <motion.a
                      key={item.id}
                      variants={fadeInUp}
                      href={item.link}
                      className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center transition-all hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <ItemIcon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                    </motion.a>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
            <p className="mt-3 text-gray-500">Trusted by millions of Indians across the country</p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeInUp}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={clsx('h-4 w-4', i < t.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200')} />
                  ))}
                </div>
                <Quote className="mb-2 h-6 w-6 text-blue-200" />
                <p className="text-sm leading-relaxed text-gray-600">{t.text}</p>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.location}</p>
                  <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{t.policy}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to find the perfect insurance?</h2>
            <p className="mt-4 text-lg text-blue-200">Join 9 million+ Indians who trust us for their insurance needs</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="/policies"
                className="rounded-lg bg-orange-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-orange-600"
              >
                Explore Plans
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="/chat"
                className="rounded-lg border-2 border-white bg-transparent px-8 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Ask AI Advisor
              </motion.a>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-blue-300">
              <CheckCircle className="h-4 w-4" /> Free consultation. No spam. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Bottom Trust Bar ── */}
      <section className="bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-gray-400">
            <span>IRDAI Registered Broker</span>
            <span>ISO 27001 Certified</span>
            <span>PCI DSS Compliant</span>
            <span>Secure Payment Gateway</span>
            <span>100% Data Protection</span>
            <span>Made with ❤️ in India</span>
          </div>
        </div>
      </section>
    </div>
  );
}
