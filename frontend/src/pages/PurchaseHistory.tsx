import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store'
import { profileApi } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react'

const statusIcons: Record<string, any> = {
  completed: CheckCircle,
  pending: Clock,
  failed: XCircle,
  refunded: Clock,
}

const statusColors: Record<string, string> = {
  completed: 'text-green-600 bg-green-50',
  pending: 'text-yellow-600 bg-yellow-50',
  failed: 'text-red-600 bg-red-50',
  refunded: 'text-purple-600 bg-purple-50',
}

export default function PurchaseHistory() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileApi.getPurchases().then(setPurchases).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (!user) return <div className="min-h-screen pt-24 flex items-center justify-center"><p className="text-gray-500">Please log in</p></div>

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <button onClick={() => navigate('/profile')} className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </button>
        <h1 className="mb-6 text-xl font-bold text-gray-900">Purchase History</h1>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : purchases.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No purchases yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((p) => {
              const StatusIcon = statusIcons[p.status] || Clock
              const statusColor = statusColors[p.status] || 'text-gray-600 bg-gray-50'
              return (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                  <div>
                    <p className="font-medium text-gray-900">{p.policy_name}</p>
                    <p className="text-xs text-gray-500">₹{p.amount.toLocaleString()} &middot; {p.tenure} year(s)</p>
                    <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                    <StatusIcon className="h-3 w-3" /> {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
