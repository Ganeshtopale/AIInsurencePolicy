import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import clsx from 'clsx'

const faqs = [
  {
    category: 'General',
    items: [
      { q: 'What is Insurance Bazaar?', a: 'Insurance Bazaar is India\'s first AI-powered insurance marketplace. We help you compare, choose, and buy insurance policies from 50+ insurers at the best prices.' },
      { q: 'Is Insurance Bazaar IRDAI registered?', a: 'Yes, we are an IRDAI-registered insurance broker (Registration No: XXX). Your policy purchases through our platform are completely valid and recognized by all insurers.' },
      { q: 'Do I need to pay any fees for using Insurance Bazaar?', a: 'No, our services are completely free for customers. We earn from the insurance companies when you purchase a policy through our platform.' },
    ],
  },
  {
    category: 'Buying Policy',
    items: [
      { q: 'How do I buy a policy on Insurance Bazaar?', a: 'Simply browse policies, compare quotes side-by-side, select the one that suits you best, and complete the purchase online. Our AI advisor can also help recommend the right policy.' },
      { q: 'Can I compare policies from different companies?', a: 'Yes, you can compare policies from 50+ insurers based on features, premium, coverage, claim settlement ratio, and more.' },
      { q: 'Is it safe to buy insurance online?', a: 'Absolutely. We use 256-bit SSL encryption to protect your data. All transactions are secure and your information is never shared without your consent.' },
    ],
  },
  {
    category: 'Payments & Renewals',
    items: [
      { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards, net banking, UPI (Google Pay, PhonePe, Paytm), and EMI options.' },
      { q: 'How do I renew my policy?', a: 'You can renew your policy by logging into your dashboard and selecting the policy you wish to renew. We will send you reminders before your policy expires.' },
      { q: 'Can I change my payment frequency?', a: 'Yes, you can switch between monthly, quarterly, half-yearly, and yearly payment options based on the policy terms.' },
    ],
  },
  {
    category: 'Claims',
    items: [
      { q: 'How do I file a claim?', a: 'You can file a claim by calling our 24/7 claim helpline at 8669065575 or by visiting the Claims section in your dashboard.' },
      { q: 'How long does claim settlement take?', a: 'Most claims are settled within 7-15 working days once all required documents are submitted. Complex cases may take up to 30 days.' },
      { q: 'What if my claim is rejected?', a: 'If your claim is rejected, you can reach out to our grievance redressal team. If still unsatisfied, you can approach the Insurance Ombudsman for free.' },
    ],
  },
  {
    category: 'Account & Security',
    items: [
      { q: 'How do I create an account?', a: 'Click on "Sign In" and select "Register". Enter your name, email, phone number, and create a password. You can also sign up using Google.' },
      { q: 'I forgot my password. What should I do?', a: 'Click on "Forgot Password" on the login page, enter your registered email, and we will send you an OTP to reset your password.' },
      { q: 'Is my personal data safe?', a: 'Yes, we follow strict data protection protocols compliant with Indian IT laws. Your data is encrypted and never shared without your explicit consent.' },
    ],
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = faqs.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Find answers to common questions about insurance, policies, claims, and more.
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search FAQs..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-3.5 pl-12 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm"
          />
        </div>

        <div className="space-y-8">
          {filtered.map((cat) => (
            <div key={cat.category}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">{cat.category}</h2>
              <div className="space-y-2">
                {cat.items.map((item) => {
                  const key = `${cat.category}-${item.q}`
                  const isOpen = openIndex === key
                  return (
                    <div key={key} className="rounded-xl bg-white shadow-sm overflow-hidden">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : key)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-900">{item.q}</span>
                        <ChevronDown className={clsx('h-5 w-5 shrink-0 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
                      </button>
                      {isOpen && (
                        <div className="border-t border-gray-100 px-6 py-4">
                          <p className="text-gray-600 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}