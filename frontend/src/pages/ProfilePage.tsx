import { useAuthStore } from '@/store'
import { Link } from 'react-router-dom'
import { User, Shield, ChevronRight, ShoppingBag, Key, Edit3, Briefcase } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuthStore()

  if (!user) return <div className="min-h-screen pt-24 flex items-center justify-center"><p className="text-gray-500">Please log in</p></div>

  const links = [
    { label: 'Edit Profile', href: '/profile/edit', icon: Edit3, desc: 'Update your personal information' },
    { label: 'Change Password', href: '/profile/change-password', icon: Key, desc: 'Update your password' },
    { label: 'Applied Jobs', href: '/profile/applied-jobs', icon: Briefcase, desc: 'Track your job application status' },
    { label: 'Purchase History', href: '/profile/purchases', icon: ShoppingBag, desc: 'View your policy purchases' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.role === 'admin' && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                <Shield className="h-3 w-3" /> Admin
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {links.map((link) => (
            <Link key={link.label} to={link.href}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <link.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{link.label}</p>
                  <p className="text-xs text-gray-500">{link.desc}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
