import { Shield, Award, Users, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function About() {
  const stats = [
    { icon: Users, label: 'Happy Customers', value: '10M+' },
    { icon: Award, label: 'IRDAI Registered', value: '100%' },
    { icon: Shield, label: 'Claims Settled', value: '5L+' },
    { icon: TrendingUp, label: 'Partners', value: '50+' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">About Insurance Bazaar</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            India's most trusted AI-powered insurance marketplace. We help you compare, choose, and buy
            the best insurance policies tailored to your needs.
          </p>
        </div>

        <div className="mb-20 grid gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <s.icon className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Mission</h2>
            <p className="mb-4 text-gray-600">
              At Insurance Bazaar, we leverage cutting-edge artificial intelligence to simplify insurance
              for every Indian. Our mission is to make insurance transparent, affordable, and accessible
              to all.
            </p>
            <p className="text-gray-600">
              With our AI-powered comparison engine, we analyze hundreds of policies across multiple
              providers to find the perfect coverage at the best price.
            </p>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Why Choose Us</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>AI-powered personalized policy recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>Compare 50+ insurance providers side-by-side</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>100% transparent pricing with no hidden charges</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>Instant claim assistance and support</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>IRDAI registered and trusted by millions</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
