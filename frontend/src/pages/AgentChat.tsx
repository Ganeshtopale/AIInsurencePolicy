import { useState, useEffect, useRef, useCallback } from 'react'
import { chatApi, adminApi, policyApi, AgentConversation, ChatMessageItem } from '@/services/api'
import { useAuthStore } from '@/store'
import { MessageSquare, User, Bot, Send, XCircle, Loader2, Bell, ShoppingCart, X, CheckCircle, AlertCircle, Building2 } from 'lucide-react'
import FileUpload from '@/components/FileUpload'

export default function AgentChat() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<AgentConversation[]>([])
  const [selected, setSelected] = useState<AgentConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [tab, setTab] = useState<'pending' | 'active' | 'closed'>('pending')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [showPurchase, setShowPurchase] = useState(false)
  const [policies, setPolicies] = useState<any[]>([])
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseMsg, setPurchaseMsg] = useState('')

  const [showNewProvider, setShowNewProvider] = useState(false)
  const [providerForm, setProviderForm] = useState({ name: '', logo_url: '', description: '', website: '', contact_email: '', contact_phone: '', founded_year: '', provider_type: 'life', rating: '' })
  const [creatingProvider, setCreatingProvider] = useState(false)
  const [providerMsg, setProviderMsg] = useState('')

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatApi.getConversations(tab)
      setConversations(data)
    } catch { setConversations([]) }
    setLoading(false)
  }, [tab])

  const loadNotifications = useCallback(async () => {
    try {
      const n = await chatApi.getNotifications()
      setPendingCount(n.pending_count)
    } catch {}
  }, [])

  useEffect(() => {
    loadConversations()
    loadNotifications()
  }, [loadConversations, loadNotifications])

  useEffect(() => {
    if (!user) return
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/ws/agent/${user.id}`
    const ws = new WebSocket(wsUrl)
    ws.onmessage = () => {
      loadConversations()
      loadNotifications()
    }
    ws.onclose = () => {
      setTimeout(loadNotifications, 3000)
    }
    return () => ws.close()
  }, [user?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openConversation = async (conv: AgentConversation) => {
    setSelected(conv)
    try {
      const msgs = await chatApi.getConversationMessages(conv.id)
      setMessages(msgs)
    } catch { setMessages([]) }
  }

  const acceptConversation = async (convId: number) => {
    try {
      await chatApi.acceptConversation(convId)
      setTab('active')
      loadConversations()
      loadNotifications()
    } catch (err) { alert('Failed to accept conversation') }
  }

  const openPurchaseModal = async () => {
    setPurchaseMsg('')
    setSelectedPolicyId(null)
    try {
      const data = await policyApi.getPolicies({})
      setPolicies(data || [])
    } catch {
      setPolicies([])
    }
    setShowPurchase(true)
  }

  const handlePurchaseForCustomer = async () => {
    if (!selected || !selectedPolicyId) return
    setPurchasing(true)
    setPurchaseMsg('')
    try {
      const res = await adminApi.purchaseForCustomer({ customer_id: selected.user_id, policy_id: selectedPolicyId })
      setPurchaseMsg(res.message)
    } catch (err: any) {
      setPurchaseMsg(err?.response?.data?.detail || 'Failed to purchase policy')
    } finally {
      setPurchasing(false)
    }
  }

  const closeConversation = async (convId: number) => {
    try {
      await chatApi.closeConversation(convId)
      setSelected(null)
      setConversations((prev) => prev.filter((c) => c.id !== convId))
      loadNotifications()
    } catch (err) { alert('Failed to close conversation') }
  }

  const sendMessage = async () => {
    if (!input.trim() || !selected || sending) return
    setSending(true)
    const msg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { id: 'temp', role: 'agent', content: msg, created_at: new Date().toISOString() }])
    try {
      const result = await chatApi.agentSendMessage(selected.id, msg)
      setMessages((prev) => prev.map((m) => m.id === 'temp' ? { ...result } : m))
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== 'temp'))
      alert('Failed to send message')
    }
    setSending(false)
  }

  if (user?.role !== 'admin' && user?.role !== 'agent') {
    return <div className="p-8 text-center text-red-500">Access denied. Agent or Admin role required.</div>
  }

  return (
    <div className="flex h-screen bg-gray-50 pt-16 lg:pt-28">
      <div className="flex w-80 flex-col border-r bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold text-gray-900">Chat Inbox</h2>
          <div className="flex items-center gap-1 text-sm text-orange-600">
            <Bell className="h-4 w-4" />
            {pendingCount > 0 && <span className="font-bold">{pendingCount}</span>}
          </div>
        </div>

        <div className="flex border-b">
          <button onClick={() => setTab('pending')} className={`flex-1 py-2 text-xs font-medium ${tab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}>
            Pending ({pendingCount})
          </button>
          <button onClick={() => setTab('active')} className={`flex-1 py-2 text-xs font-medium ${tab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}>
            Active
          </button>
          <button onClick={() => setTab('closed')} className={`flex-1 py-2 text-xs font-medium ${tab === 'closed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}>
            History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No {tab} conversations</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`cursor-pointer border-b px-4 py-3 transition hover:bg-gray-50 ${selected?.id === conv.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{conv.user_name}</p>
                      <p className="text-xs text-gray-400">#{conv.id}</p>
                    </div>
                  </div>
                  {tab === 'pending' && (
                    <button onClick={(e) => { e.stopPropagation(); acceptConversation(conv.id) }} className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600">
                      Accept
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between border-b bg-white px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selected.user_name}</h3>
                  <span className={`text-xs ${selected.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selected.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={openPurchaseModal} className="flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50">
                  <ShoppingCart className="h-3.5 w-3.5" /> Buy Policy
                </button>
                <button onClick={() => { setProviderMsg(''); setShowNewProvider(true) }} className="flex items-center gap-1 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50">
                  <Building2 className="h-3.5 w-3.5" /> New Provider
                </button>
                <button onClick={() => closeConversation(selected.id)} className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                  <XCircle className="h-3.5 w-3.5" /> Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 px-6 py-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? '' : 'justify-end'}`}>
                  {msg.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.role === 'user' ? 'rounded-tl-none bg-gray-100' : msg.role === 'agent' ? 'rounded-tr-none bg-blue-600 text-white' : 'rounded-tl-none bg-white'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="mt-1 text-[10px] opacity-60">{new Date(msg.created_at).toLocaleTimeString()}</p>
                  </div>
                  {msg.role !== 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t bg-white px-6 py-3">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                  placeholder="Type your reply..."
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-400"
                />
                <button onClick={sendMessage} disabled={!input.trim() || sending} className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12" />
              <p className="mt-2 text-sm">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
      {showNewProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">New Provider</h2>
              <button onClick={() => setShowNewProvider(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 p-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={providerForm.name} onChange={(e) => setProviderForm({...providerForm, name: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                <FileUpload currentUrl={providerForm.logo_url} onUploaded={(url) => setProviderForm({...providerForm, logo_url: url})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={providerForm.provider_type} onChange={(e) => setProviderForm({...providerForm, provider_type: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400">
                    <option value="life">Life</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                  <input value={providerForm.founded_year} onChange={(e) => setProviderForm({...providerForm, founded_year: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input value={providerForm.website} onChange={(e) => setProviderForm({...providerForm, website: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input value={providerForm.contact_email} onChange={(e) => setProviderForm({...providerForm, contact_email: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input value={providerForm.contact_phone} onChange={(e) => setProviderForm({...providerForm, contact_phone: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
                <input value={providerForm.rating} onChange={(e) => setProviderForm({...providerForm, rating: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={providerForm.description} onChange={(e) => setProviderForm({...providerForm, description: e.target.value})} rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>

              {providerMsg && (
                <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${providerMsg.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {providerMsg.includes('Error') ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
                  {providerMsg}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowNewProvider(false)} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button
                  onClick={async () => {
                    if (!providerForm.name.trim()) { setProviderMsg('Name is required'); return }
                    setCreatingProvider(true)
                    setProviderMsg('')
                    try {
                      await adminApi.createProvider({
                        name: providerForm.name,
                        logo_url: providerForm.logo_url || undefined,
                        description: providerForm.description || undefined,
                        website: providerForm.website || undefined,
                        contact_email: providerForm.contact_email || undefined,
                        contact_phone: providerForm.contact_phone || undefined,
                        founded_year: providerForm.founded_year ? Number(providerForm.founded_year) : undefined,
                        provider_type: providerForm.provider_type,
                        rating: providerForm.rating ? Number(providerForm.rating) : undefined,
                      })
                      setProviderMsg('Provider created successfully!')
                      setProviderForm({ name: '', logo_url: '', description: '', website: '', contact_email: '', contact_phone: '', founded_year: '', provider_type: 'life', rating: '' })
                    } catch (err: any) {
                      setProviderMsg(err?.response?.data?.detail || 'Error creating provider')
                    } finally {
                      setCreatingProvider(false)
                    }
                  }}
                  disabled={!providerForm.name.trim() || creatingProvider}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70"
                >
                  {creatingProvider ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                  {creatingProvider ? 'Creating...' : 'Create Provider'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Purchase Policy for Customer</h2>
              <button onClick={() => setShowPurchase(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              {selected && (
                <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                  Customer: <strong>{selected.user_name}</strong>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Policy</label>
                <select
                  value={selectedPolicyId ?? ''}
                  onChange={(e) => setSelectedPolicyId(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">-- Choose a policy --</option>
                  {policies.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ₹{p.premium}/mo ({p.provider_name || p.provider})
                    </option>
                  ))}
                </select>
              </div>

              {purchaseMsg && (
                <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                  purchaseMsg.includes('Failed') || purchaseMsg.includes('Cannot')
                    ? 'bg-red-50 text-red-700'
                    : 'bg-green-50 text-green-700'
                }`}>
                  {purchaseMsg.includes('Failed') || purchaseMsg.includes('Cannot')
                    ? <AlertCircle className="h-4 w-4 shrink-0" />
                    : <CheckCircle className="h-4 w-4 shrink-0" />
                  }
                  {purchaseMsg}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowPurchase(false)}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  onClick={handlePurchaseForCustomer}
                  disabled={!selectedPolicyId || purchasing}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
                >
                  {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                  {purchasing ? 'Purchasing...' : 'Confirm Purchase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
