import { Link } from 'react-router-dom'

export default function Sitemap() {
  const sections = [
    {
      title: 'Insurance',
      links: [
        { label: 'All Policies', href: '/policies' },
        { label: 'Compare Quotes', href: '/compare' },
        { label: 'AI Advisor', href: '/chat' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Profile', href: '/profile' },
        { label: 'Purchase History', href: '/profile/purchases' },
        { label: 'Leads', href: '/leads' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Partner With Us', href: '/partner' },
        { label: 'Blog', href: '/blog' },
        { label: 'Press Release', href: '/press' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Grievance Redressal', href: '/grievance' },
        { label: 'Claims Procedure', href: '/claims' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Use', href: '/terms' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Sitemap</h1>
          <p className="text-lg text-gray-600">Complete list of all pages on Insurance Bazaar.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">{section.title}</h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-blue-600 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
