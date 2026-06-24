import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Have a question or need help? We're here for you 24/7.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mb-12">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Phone</h3>
            <p className="text-sm text-gray-500">Sales Enquiry</p>
            <a href="tel:8669065575" className="font-semibold text-blue-600 hover:underline">8669065575</a>
            <p className="mt-2 text-sm text-gray-500">Claim Support</p>
            <a href="tel:8669065575" className="font-semibold text-blue-600 hover:underline">8669065575</a>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Email</h3>
            <p className="text-sm text-gray-500">General Enquiries</p>
            <a href="mailto:support@insurancebazaar.app" className="font-semibold text-blue-600 hover:underline">support@insurancebazaar.app</a>
            <p className="mt-2 text-sm text-gray-500">Press & Media</p>
            <a href="mailto:press@insurancebazaar.app" className="font-semibold text-blue-600 hover:underline">press@insurancebazaar.app</a>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Office</h3>
            <p className="text-sm text-gray-600">AI Insurance Bazaar Pvt. Ltd.</p>
            <p className="text-sm text-gray-500">Omkar Nagar, Nagpur Maharashtra, India</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Send us a message</h2>
            {submitted ? (
              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-700">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">Message sent successfully!</p>
                  <p className="text-sm">Our team will get back to you within 24 hours.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" required />
                </div>
                <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition">
                  <Send className="h-4 w-4" /> Send Message
                </button>
              </form>
            )}
          </div>

          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Office Hours</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">Customer Support</p>
                  <p className="text-sm">Monday - Saturday: 8:00 AM - 10:00 PM</p>
                  <p className="text-sm">Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">Claim Support</p>
                  <p className="text-sm">24/7 - 365 days</p>
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Emergency?</strong> For urgent claim assistance, call our 24/7 helpline at{' '}
                <a href="tel:8669065575" className="font-semibold underline">8669065575</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}