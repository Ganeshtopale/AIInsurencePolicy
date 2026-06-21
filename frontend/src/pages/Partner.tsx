import { TrendingUp, Users, BarChart, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Partner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Partner With Us</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Join India's leading AI-powered insurance marketplace and grow your business with us.
          </p>
        </div>

        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Revenue Growth</h3>
            <p className="text-sm text-gray-600">Access millions of potential customers and boost your sales with our AI-powered recommendation engine.</p>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Wide Reach</h3>
            <p className="text-sm text-gray-600">Get listed alongside top insurance providers and reach customers across all major Indian cities.</p>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <BarChart className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Data Insights</h3>
            <p className="text-sm text-gray-600">Get detailed analytics and insights about customer behaviour, market trends, and performance metrics.</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Partner Benefits</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-gray-600">Zero upfront fee for partnership onboarding</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-gray-600">Performance-based revenue sharing model</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-gray-600">Dedicated account manager for partner support</span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-gray-600">API integration for seamless policy uploads</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-gray-600">Real-time lead generation and tracking dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-gray-600">Co-marketing opportunities and brand visibility</span>
              </li>
            </ul>
          </div>
          <div className="mt-8 text-center">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">
              Become a Partner
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
