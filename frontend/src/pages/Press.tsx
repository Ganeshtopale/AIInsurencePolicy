import { Calendar, ExternalLink } from 'lucide-react'

export default function Press() {
  const releases = [
    {
      title: 'Insurance Bazaar Crosses 10 Million Customer Milestone',
      date: '12 Jan 2026',
      summary: 'Insurance Bazaar, India\'s leading AI-powered insurance marketplace, announced that it has crossed 10 million registered customers.',
    },
    {
      title: 'Insurance Bazaar Launches AI-Powered Claim Assistant',
      date: '5 Dec 2025',
      summary: 'New AI-powered feature simplifies the insurance claim process, reducing average claim settlement time by 60%.',
    },
    {
      title: 'Insurance Bazaar Raises $50 Million in Series C Funding',
      date: '20 Oct 2025',
      summary: 'The company will use the funds to expand its AI capabilities, enter new markets, and hire top talent.',
    },
    {
      title: 'Insurance Bazaar Partners with 10 New Insurance Providers',
      date: '15 Sep 2025',
      summary: 'Strategic partnerships expand the platform\'s policy offerings across health, life, motor, and travel insurance.',
    },
    {
      title: 'Insurance Bazaar Wins "Best InsurTech Platform 2025" Award',
      date: '8 Aug 2025',
      summary: 'Recognized at the India InsurTech Summit for innovation in AI-driven insurance distribution.',
    },
    {
      title: 'Insurance Bazaar Introduces Real-Time Policy Comparison',
      date: '1 Jun 2025',
      summary: 'New real-time comparison feature allows customers to compare policies across 50+ providers instantly.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Press Releases</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">Latest news and announcements from Insurance Bazaar.</p>
        </div>

        <div className="space-y-6">
          {releases.map((r) => (
            <div key={r.title} className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-gray-900">{r.title}</h2>
                  <p className="mb-3 text-sm text-gray-600">{r.summary}</p>
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="h-3 w-3" />{r.date}</span>
                </div>
                <button className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-400 transition hover:border-blue-400 hover:text-blue-600">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">For media inquiries, please contact us at</p>
          <a href="mailto:press@insurancebazaar.app" className="font-semibold text-blue-600 hover:underline">press@insurancebazaar.app</a>
        </div>
      </div>
    </div>
  )
}
