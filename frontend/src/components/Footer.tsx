import { Link } from 'react-router-dom'
import {
  Shield,
  Heart,
  TrendingUp,
  Car,
  Bike,
  Plane,
  Building2,
  Users,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Lock,
  Smartphone,
} from 'lucide-react'

const productLinks = [
  { icon: Heart, label: 'Health Insurance', href: '/policies?type=health' },
  { icon: Shield, label: 'Term Life Insurance', href: '/policies?type=term' },
  { icon: TrendingUp, label: 'Investment Plans', href: '/policies?type=investment' },
  { icon: Car, label: 'Car Insurance', href: '/policies?type=car' },
  { icon: Bike, label: 'Two Wheeler Insurance', href: '/policies?type=bike' },
  { icon: Plane, label: 'Travel Insurance', href: '/policies?type=travel' },
  { icon: Building2, label: 'Group Insurance', href: '/policies?type=group' },
  { icon: Users, label: 'Senior Citizen Plans', href: '/policies?type=senior' },
]

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Partner With Us', href: '/partner' },
  { label: 'Blog', href: '/blog' },
  { label: 'Press Release', href: '/press' },
  { label: 'Sitemap', href: '/sitemap' },
]

const supportLinks = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Grievance Redressal', href: '/grievance' },
  { label: 'Claims Procedure', href: '/claims' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
]

const partners = [
  { name: 'HDFC Ergo', short: 'HDFC' },
  { name: 'ICICI Lombard', short: 'ICICI' },
  { name: 'Bajaj Allianz', short: 'BAJAJ' },
  { name: 'Tata AIG', short: 'TATA' },
  { name: 'SBI General', short: 'SBI' },
  { name: 'Star Health', short: 'STAR' },
  { name: 'Max Bupa', short: 'MAX' },
  { name: 'Kotak Mahindra', short: 'KOTAK' },
  { name: 'Reliance General', short: 'RELIANCE' },
  { name: 'Future Generali', short: 'FUTURE' },
]

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'Youtube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
]

export default function Footer() {
  return (
    <footer className="bg-insurance-dark-900 text-insurance-dark-200">
      {/* Top CTA */}
      <div className="bg-gradient-to-r from-insurance-orange-500 to-insurance-orange-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-white">Need help finding the right insurance?</h3>
              <p className="text-orange-100 text-sm mt-1">Our experts are available 24/7 to assist you</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="tel:8669065575"
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-insurance-orange-600 hover:bg-orange-50 transition-colors"
              >
                <Phone className="h-4 w-4" />
                8669065575
              </a>
              <Link
                to="/chat"
                className="flex items-center gap-2 rounded-lg border-2 border-white/30 px-5 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Chat with AI
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer columns */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-3">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-insurance-orange-500 to-insurance-orange-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Insurance<span className="text-insurance-orange-400">Bazaar</span>
              </span>
            </Link>
            <p className="text-sm text-insurance-dark-400 leading-relaxed mb-4">
              India's first AI-powered insurance marketplace. Compare 10,000+ plans from 51+ insurers and save up to 40% on your premiums.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-1.5 rounded-lg bg-insurance-dark-800 px-3 py-1.5 text-xs text-insurance-dark-300">
                <ShieldCheck className="h-3.5 w-3.5 text-insurance-green-400" />
                IRDAI Reg.
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-insurance-dark-800 px-3 py-1.5 text-xs text-insurance-dark-300">
                <Award className="h-3.5 w-3.5 text-insurance-orange-400" />
                ISO Certified
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-insurance-dark-800 px-3 py-1.5 text-xs text-insurance-dark-300">
                <Lock className="h-3.5 w-3.5 text-insurance-green-400" />
                PCI DSS
              </div>
            </div>

            {/* Social */}
            <div>
              <p className="text-xs font-semibold text-insurance-dark-400 uppercase tracking-wider mb-3">Follow Us</p>
              <div className="flex gap-2.5">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-insurance-dark-800 text-insurance-dark-400 hover:bg-insurance-orange-500 hover:text-white transition-all"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="mt-6 space-y-2 text-sm text-insurance-dark-400">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-insurance-orange-400" />
                <span>AI Insurance Bazaar Pvt. Ltd.,<br />Nagpur, Omkar Nagar, Maharashtra, India - 440027</span>
              </div>
              <a href="mailto:support@insurancebazaar.in" className="flex items-center gap-2 hover:text-insurance-orange-400 transition-colors">
                <Mail className="h-4 w-4 shrink-0 text-insurance-orange-400" />
                support@insurancebazaar.in
              </a>
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Insurance Products</h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-2 text-sm text-insurance-dark-400 hover:text-insurance-orange-400 transition-colors group"
                  >
                    <link.icon className="h-3.5 w-3.5 shrink-0 text-insurance-dark-500 group-hover:text-insurance-orange-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Support */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 mb-8">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-insurance-dark-400 hover:text-insurance-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-insurance-dark-400 hover:text-insurance-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Download app + Partners */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Download App</h4>
            <p className="text-sm text-insurance-dark-400 mb-3">Manage policies, track claims, and get instant support on the go.</p>
            <div className="space-y-2.5 mb-8">
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg bg-insurance-dark-800 px-4 py-3 hover:bg-insurance-dark-700 transition-colors group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-insurance-dark-600 text-white">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-[10px] text-insurance-dark-400">Download on</div>
                  <div className="text-sm font-semibold text-white">Google Play</div>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg bg-insurance-dark-800 px-4 py-3 hover:bg-insurance-dark-700 transition-colors group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-insurance-dark-600 text-white">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-[10px] text-insurance-dark-400">Download on</div>
                  <div className="text-sm font-semibold text-white">App Store</div>
                </div>
              </a>
            </div>

            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Our Partners</h4>
            <div className="flex flex-wrap gap-2">
              {partners.map((p) => (
                <span
                  key={p.name}
                  title={p.name}
                  className="rounded-lg bg-insurance-dark-800 px-3 py-1.5 text-xs font-medium text-insurance-dark-300 hover:bg-insurance-dark-700 hover:text-insurance-orange-400 transition-colors"
                >
                  {p.short}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-insurance-dark-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-insurance-dark-500">
            <p>
              &copy; {new Date().getFullYear()} InsuranceBazaar Pvt. Ltd. All rights reserved. | IRDAI Registration No: XXX | CIN: U12345MH2020PTC123456
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-insurance-orange-400 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-insurance-orange-400 transition-colors">Terms</Link>
              <Link to="/disclaimer" className="hover:text-insurance-orange-400 transition-colors">Disclaimer</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
