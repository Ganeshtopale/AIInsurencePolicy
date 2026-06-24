import { Shield, Lock, Eye, Database, Mail, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Privacy() {
  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: 'We collect personal information including your name, email address, phone number, date of birth, PAN, Aadhaar (if required for policy purchase), and financial information necessary for processing insurance applications.',
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: 'Your information is used to process insurance quotes, facilitate policy purchases, verify identity, process claims, send policy-related communications, improve our services, and comply with legal and regulatory requirements.',
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: 'We implement robust security measures including 256-bit SSL encryption, firewalls, access controls, and regular security audits to protect your personal information from unauthorized access, disclosure, alteration, or destruction.',
    },
    {
      icon: Shield,
      title: 'Information Sharing',
      content: 'We share your information only with insurance partners to process your policy applications and claims. We do not sell your personal information to third parties. Data shared with insurers is governed by their respective privacy policies.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Last updated: 1st January 2026
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-600 leading-relaxed">
              AI Insurance Bazaar Pvt. Ltd. ("Insurance Bazaar," "we," "us," or "our") is committed to protecting the privacy of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {sections.map((s) => (
              <div key={s.title} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <s.icon className="h-5 w-5" />
                </div>
                <h2 className="mb-2 text-lg font-bold text-gray-900">{s.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Your Rights</h2>
            <p className="mb-4 text-gray-600">You have the right to:</p>
            <ul className="space-y-2 text-gray-600">
              {[
                'Access the personal information we hold about you',
                'Request correction of inaccurate or incomplete data',
                'Request deletion of your personal data (subject to legal obligations)',
                'Withdraw consent for data processing at any time',
                'Lodge a complaint with the relevant data protection authority',
              ].map((right) => (
                <li key={right} className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span className="text-sm">{right}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-xl bg-blue-50 p-6 text-center">
            <Mail className="mx-auto mb-2 h-6 w-6 text-blue-600" />
            <p className="text-blue-800">
              For privacy-related queries, contact us at{' '}
              <a href="mailto:privacy@insurancebazaar.app" className="font-semibold underline">privacy@insurancebazaar.app</a>
            </p>
            <Link to="/contact" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
              Contact Us <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}