import { Shield, Clock, Mail, Phone, FileText, AlertTriangle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Grievance() {
  const steps = [
    { icon: FileText, title: 'Submit Grievance', desc: 'File your complaint through our online portal, email, or phone.' },
    { icon: Clock, title: 'Acknowledgment (24 hrs)', desc: 'You will receive an acknowledgment within 24 working hours.' },
    { icon: AlertTriangle, title: 'Resolution (15 days)', desc: 'We resolve most grievances within 15 business days.' },
    { icon: Shield, title: 'Escalation', desc: 'If unresolved, escalate to the Grievance Officer for review.' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Grievance Redressal</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            We are committed to resolving your concerns promptly and fairly.
          </p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.title} className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">How to File a Grievance</h2>
            <ol className="space-y-4 text-gray-600">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">1</span>
                <span>Send an email to <a href="mailto:grievance@insurancebazaar.app" className="font-semibold text-blue-600">grievance@insurancebazaar.app</a> with your policy details and issue description.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">2</span>
                <span>Call our Grievance helpline at <a href="tel:18002088787" className="font-semibold text-blue-600">1800-208-8787</a> (Mon-Sat, 8 AM - 10 PM).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">3</span>
                <span>Write to us at: Grievance Officer, AI Insurance Bazaar Pvt. Ltd., Mumbai, Maharashtra.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">4</span>
                <span>If unsatisfied with the resolution, you may approach the Insurance Ombudsman or IRDAI.</span>
              </li>
            </ol>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Grievance Officer</h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">Mr. Rajesh Kumar</p>
                <p className="text-sm text-gray-500">Chief Grievance Officer</p>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-5 w-5 text-orange-500" />
                <a href="mailto:grievance@insurancebazaar.app" className="text-blue-600 hover:underline">grievance@insurancebazaar.app</a>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="h-5 w-5 text-orange-500" />
                <a href="tel:18002088787" className="text-blue-600 hover:underline">1800-208-8787</a>
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>IRDAI Information:</strong> If your grievance is not resolved within 30 days, you can file a complaint with IRDAI through their portal at{' '}
                <a href="https://www.irdai.gov.in" target="_blank" rel="noopener noreferrer" className="font-semibold underline">www.irdai.gov.in</a>
              </p>
            </div>
            <Link to="/contact" className="mt-6 inline-flex items-center gap-1 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition">
              Contact Grievance Officer <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}