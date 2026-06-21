import { Calendar, User, ArrowRight } from 'lucide-react'

export default function Blog() {
  const posts = [
    {
      title: 'How AI is Transforming Insurance in India',
      excerpt: 'Discover how artificial intelligence is making insurance more accessible, affordable, and transparent for millions of Indians.',
      author: 'PolicyBazar Team',
      date: '15 Mar 2026',
      category: 'AI & Insurance',
    },
    {
      title: '5 Common Mistakes to Avoid When Buying Health Insurance',
      excerpt: 'Learn about the most common pitfalls people face when purchasing health insurance and how to avoid them.',
      author: 'Rahul Sharma',
      date: '10 Mar 2026',
      category: 'Health Insurance',
    },
    {
      title: 'Term Insurance vs ULIP: Which One is Right for You?',
      excerpt: 'A comprehensive comparison between term insurance and ULIPs to help you make an informed decision.',
      author: 'Priya Patel',
      date: '5 Mar 2026',
      category: 'Life Insurance',
    },
    {
      title: 'Complete Guide to Motor Insurance Claims',
      excerpt: 'Everything you need to know about filing a motor insurance claim, from documentation to settlement.',
      author: 'Amit Kumar',
      date: '28 Feb 2026',
      category: 'Motor Insurance',
    },
    {
      title: 'Tax Benefits Under Section 80C and 80D',
      excerpt: 'Understand how insurance premiums can help you save tax under various sections of the Income Tax Act.',
      author: 'PolicyBazar Team',
      date: '20 Feb 2026',
      category: 'Tax Saving',
    },
    {
      title: 'Travel Insurance: Why You Should Never Skip It',
      excerpt: 'Why travel insurance is essential for both domestic and international trips, and what it covers.',
      author: 'Neha Gupta',
      date: '15 Feb 2026',
      category: 'Travel Insurance',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Blog</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Stay informed with the latest insights, tips, and guides about insurance and financial planning.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="group rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
              <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
                {post.category}
              </span>
              <h2 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">{post.title}</h2>
              <p className="mb-4 text-sm text-gray-600">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
              </div>
              <button className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                Read More <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
