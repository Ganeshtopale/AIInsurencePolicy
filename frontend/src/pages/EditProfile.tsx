import { useState } from 'react'
import { useAuthStore } from '@/store'
import { authApi } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, AtSign, Loader2, ArrowLeft, MapPin, Users, DollarSign, Calendar } from 'lucide-react'
import FileUpload from '@/components/FileUpload'

export default function EditProfile() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.username || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profilePic, setProfilePic] = useState(user?.profile_pic || '')
  const [age, setAge] = useState(user?.age?.toString() || '')
  const [city, setCity] = useState(user?.city || '')
  const [income, setIncome] = useState(user?.income || '')
  const [familySize, setFamilySize] = useState(user?.family_size?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (!user) return <div className="min-h-screen pt-24 flex items-center justify-center"><p className="text-gray-500">Please log in</p></div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const updated = await authApi.updateProfile({
        name,
        username,
        phone,
        profile_pic: profilePic || undefined,
        age: age ? Number(age) : undefined,
        city: city || undefined,
        income: income || undefined,
        family_size: familySize ? Number(familySize) : undefined,
      })
      setUser(updated)
      setMessage('Profile updated successfully')
    } catch (err: any) {
      setMessage(err?.response?.data?.detail || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-28">
      <div className="mx-auto max-w-lg px-4 py-8">
        <button onClick={() => navigate('/profile')} className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </button>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-xl font-bold text-gray-900">Edit Profile</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              <FileUpload currentUrl={profilePic} onUploaded={(url) => setProfilePic(url)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="relative mt-1">
                <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="email" value={user.email} disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Annual Income</label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="e.g. 5-10 Lakhs"
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Family Size</label>
                <div className="relative mt-1">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="number" value={familySize} onChange={(e) => setFamilySize(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
            </div>
            {message && (
              <div className={`rounded-lg p-3 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-70">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
