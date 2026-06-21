import { FileText, Search, Phone, CheckCircle, ArrowRight, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Claims() {
  const steps = [
    { icon: FileText, title: 'Intimate the Claim', desc: 'Inform us about the claim within the stipulated time frame.' },
    { icon: Search, title: 'Submit Documents', desc: 'Upload all required documents through our portal or email.' },
    { icon: CheckCircle, title: 'Claim Assessment', desc: 'Our team verifies and assesses your claim.' },
    { icon: Phone, title: 'Claim Settlement', desc: 'Once approved, the claim amount is disbursed to you.' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Claims Procedure</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            We make the claim process simple, transparent, and stress-free.
          </p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-xl bg-white p-6 text-center shadow-sm relative">
              <span className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{i + 1}</span>
              <div className="mx-auto mb-3 mt-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Required Documents</h2>
            <div className="space-y-3">
              {[
                'Duly filled claim form',
                'Original insurance policy document',
                'Identity proof (Aadhaar, PAN, Voter ID)',
                'Medical reports / Hospital bills (for health claims)',
                'Police FIR / Investigation report (for motor/theft claims)',
                'Death certificate (for life insurance claims)',
                'Bank account details for claim disbursement',
              ].map((doc) => (
                <div key={doc} className="flex items-start gap-2 text-gray-600">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span className="text-sm">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Claim Support</h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Phone className="h-5 w-5" />
                  <span className="font-semibold">Claim Helpline (24/7)</span>
                </div>
                <a href="tel:8669065575" className="mt-1 inline-block font-bold text-green-700">8669065575</a>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <HelpCircle className="h-5 w-5" />
                  <span className="font-semibold">Track Existing Claim</span>
                </div>
                <p className="mt-1 text-sm text-blue-700">Login to your dashboard to track the status of your claim.</p>
                <Link to="/dashboard" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                  Go to Dashboard <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="rounded-lg bg-orange-50 p-4">
                <div className="flex items-center gap-2 text-orange-800">
                  <Search className="h-5 w-5" />
                  <span className="font-semibold">Cashless Network Hospitals</span>
                </div>
                <p className="mt-1 text-sm text-orange-700">Access our network of 5000+ cashless hospitals across India.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center text-white">
          <h2 className="mb-2 text-2xl font-bold">Need Help Filing a Claim?</h2>
          <p className="mb-6 text-blue-200">Our dedicated claims team is here to assist you every step of the way.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:8669065575" className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50 transition">
              <Phone className="h-4 w-4" /> Call Claim Helpline
            </a>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10 transition">
              Email Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}