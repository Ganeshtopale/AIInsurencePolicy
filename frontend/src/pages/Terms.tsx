import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export default function Terms() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By accessing or using the PolicyBazar AI website and services, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you may not use our services.',
    },
    {
      title: 'Description of Services',
      content: 'PolicyBazar AI provides an online platform that allows users to compare insurance policies from multiple insurers, obtain quotes, purchase policies, file claims, and access insurance-related information and tools.',
    },
    {
      title: 'User Responsibilities',
      content: 'You agree to provide accurate, complete, and up-to-date information when using our services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
    },
    {
      title: 'Intellectual Property',
      content: 'All content, trademarks, logos, and intellectual property on this website are owned by AI Insurance Bazaar Pvt. Ltd. or its licensors. You may not reproduce, distribute, or create derivative works without our prior written consent.',
    },
    {
      title: 'Limitation of Liability',
      content: 'PolicyBazar AI acts as an insurance broker and is not an insurance company. We strive to provide accurate information but do not guarantee the accuracy, completeness, or timeliness of the information displayed on our platform.',
    },
    {
      title: 'Termination',
      content: 'We reserve the right to suspend or terminate your access to our services at any time, without notice, for conduct that we believe violates these Terms of Use or is harmful to other users, third parties, or us.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Terms of Use</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Please read these terms carefully before using our services.
          </p>
          <p className="mt-2 text-sm text-gray-400">Last updated: 1st January 2026</p>
        </div>

        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                <div>
                  <h2 className="mb-2 text-lg font-bold text-gray-900">{s.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{s.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-yellow-50 p-6 border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800">Important Notice</h3>
              <p className="mt-1 text-sm text-yellow-700">
                These Terms of Use constitute a legally binding agreement between you and AI Insurance Bazaar Pvt. Ltd. 
                We recommend that you print or save a copy of these terms for your records.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" /> By using our services, you acknowledge that you have read and understood these terms.
          </div>
        </div>
      </div>
    </div>
  )
}