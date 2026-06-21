import { useState, useEffect, useCallback } from 'react'
import { chatApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { Link } from 'react-router-dom'
import { MessageSquare, Users, Bell, Loader2, Clock, ArrowRight } from 'lucide-react'

export default function AgentDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ pending: 0, active: 0, closed: 0 })
  const [recentConvs, setRecentConvs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [notif, convs] = await Promise.all([
        chatApi.getNotifications(),
        chatApi.getConversations('active'),
      ])
      setStats({
        pending: notif.pending_count,
        active: convs.length,
        closed: 0,
      })
      setRecentConvs(convs.slice(0, 5))
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (user?.role !== 'admin' && user?.role !== 'agent') {
    return <div className="p-8 text-center text-red-500">Access denied</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-28">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className="rounded-xl bg-white p-5 shadow-sm border-l-4 border-yellow-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-3 text-yellow-600"><Clock className="h-6 w-6" /></div>
                </div>
                <Link to="/agent/chat" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-yellow-600 hover:text-yellow-700">
                  View pending <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm border-l-4 border-green-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3 text-green-600"><MessageSquare className="h-6 w-6" /></div>
                </div>
                <Link to="/agent/chat" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700">
                  Go to chat <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm border-l-4 border-blue-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notifications</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.pending > 0 ? `${stats.pending} new` : 'None'}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3 text-blue-600"><Bell className="h-6 w-6" /></div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="font-semibold text-gray-900">Active Conversations</h2>
                <Link to="/agent/chat" className="text-xs font-medium text-blue-600 hover:text-blue-700">View all</Link>
              </div>
              {recentConvs.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">No active conversations</div>
              ) : (
                <div className="divide-y">
                  {recentConvs.map((conv: any) => (
                    <Link key={conv.id} to="/agent/chat" className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{conv.user_name}</p>
                          <p className="text-xs text-gray-400">#{conv.id}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">{conv.status}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}