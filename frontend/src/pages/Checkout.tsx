import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  Lock,
  CreditCard,
  Building2,
  Smartphone,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  FileText,
  Info,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { policyApi, checkoutApi } from '@/services/api';

type PolicySummary = {
  id: string;
  name: string;
  provider: string;
  providerLogo?: string;
  type: 'term' | 'health' | 'investment' | 'car';
  premium: string;
  premiumAnnual: string;
  coverage: string;
  tenure: string;
  addons: { name: string; price: string }[];
};

type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

const paymentMethods: { id: PaymentMethod; icon: React.ElementType; label: string; desc: string }[] = [
  { id: 'card', icon: CreditCard, label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
  { id: 'upi', icon: Smartphone, label: 'UPI', desc: 'GPay, PhonePe, Paytm' },
  { id: 'netbanking', icon: Building2, label: 'Net Banking', desc: 'All major banks' },
  { id: 'wallet', icon: DollarSign, label: 'Digital Wallet', desc: 'Paytm, Mobikwik, Freecharge' },
];

function mapApiPolicy(p: any): PolicySummary {
  const premium = p.premium || 0;
  return {
    id: p.id,
    name: p.name,
    provider: p.provider_name || p.provider,
    providerLogo: p.provider_logo,
    type: 'term',
    premium: `₹${premium.toLocaleString()}/month`,
    premiumAnnual: `₹${(premium * 12).toLocaleString()}/year`,
    coverage: p.coverage_amount ? `₹${(p.coverage_amount / 100000).toFixed(p.coverage_amount >= 10000000 ? 0 : 1)}${p.coverage_amount >= 10000000 ? 'Crore' : 'Lakh'}` : '—',
    tenure: '—',
    addons: (p.features || []).slice(0, 3).map((f: string) => ({
      name: f,
      price: `₹${Math.round(premium * 0.15).toLocaleString()}/month`,
    })),
  };
}

export default function Checkout() {
  const [policy, setPolicy] = useState<PolicySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    pan: '',
    address: '',
    city: '',
    pincode: '',
    nominee: '',
    relationship: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const policyId = searchParams.get('policy');
    if (!policyId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchPolicy = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await policyApi.getPolicyById(policyId);
        if (!cancelled) setPolicy(mapApiPolicy(res));
      } catch {
        if (!cancelled) setError('Could not load policy details. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPolicy();
    return () => { cancelled = true; };
  }, []);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName) errs.firstName = 'Required';
    if (!form.lastName) errs.lastName = 'Required';
    if (!form.email) errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.phone) errs.phone = 'Required';
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = '10 digit number';
    if (!form.dob) errs.dob = 'Required';
    if (!form.pan) errs.pan = 'Required';
    else if (!/[A-Z]{5}[0-9]{4}[A-Z]/.test(form.pan)) errs.pan = 'Invalid PAN';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!form.address) errs.address = 'Required';
    if (!form.city) errs.city = 'Required';
    if (!form.pincode) errs.pincode = 'Required';
    else if (!/^\d{6}$/.test(form.pincode)) errs.pincode = '6 digit pincode';
    if (!form.nominee) errs.nominee = 'Required';
    if (!form.relationship) errs.relationship = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const parsePremium = (premiumStr: string): number => {
    const num = parseInt(premiumStr.replace(/[₹,]/g, ''));
    return isNaN(num) ? 456 : num;
  };

  const basePremium = policy ? parsePremium(policy.premium) : 0;
  const addonTotal = policy ? policy.addons.reduce((sum, a) => sum + parsePremium(a.price), 0) : 0;
  const totalPremium = basePremium + addonTotal;
  const gst = Math.round(totalPremium * 0.18);
  const grandTotal = totalPremium + gst;

  const handlePurchase = async () => {
    if (!policy) return;
    setProcessing(true);
    try {
      await loadRazorpayScript();
      const order = await checkoutApi.createOrder({
        policy_id: parseInt(policy.id) || 1,
      });

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'PolicyBazaar AI',
        description: order.name,
        order_id: order.order_id,
        prefill: {
          email: order.prefill_email,
          contact: order.prefill_contact,
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await checkoutApi.verifyPayment(response);
            toast.success('Payment successful!');
            setStep(4);
          } catch {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      toast.error('Failed to initiate payment. Please try again.');
      setProcessing(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise<void>((resolve) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'term': return 'from-blue-500 to-blue-600';
      case 'health': return 'from-orange-400 to-orange-600';
      case 'investment': return 'from-green-500 to-green-600';
      case 'car': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading policy details...</p>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Policy Not Found</h2>
          <p className="mt-2 text-sm text-gray-500">{error || 'The policy you are looking for does not exist or has been removed.'}</p>
          <a href="/policies" className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">Browse Policies</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Lock className="h-3 w-3" /> 256-bit SSL Secured
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-0">
            {[
              { num: 1, label: 'Personal Details' },
              { num: 2, label: 'Address & Nominee' },
              { num: 3, label: 'Payment' },
              { num: 4, label: 'Confirmation' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={clsx(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition',
                      step > s.num ? 'bg-green-500 text-white' : step === s.num ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400',
                    )}
                  >
                    {step > s.num ? <CheckCircle className="h-4 w-4" /> : s.num}
                  </div>
                  <span className={clsx('mt-1 hidden text-[10px] sm:block', step === s.num ? 'font-medium text-blue-600' : 'text-gray-400')}>
                    {s.label}
                  </span>
                </div>
                {i < 3 && <div className={clsx('mx-2 h-0.5 w-8 sm:w-16', step > s.num ? 'bg-green-500' : 'bg-gray-200')} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-5xl px-4 pt-4">
          <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 border border-yellow-200">
            {error}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <motion.div
              key={String(step)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
                  <p className="mt-1 text-sm text-gray-400">As per your PAN / Aadhaar</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">First Name *</label>
                      <input
                        type="text" value={form.firstName} onChange={(e) => updateForm('firstName', e.target.value)}
                        className={clsx('w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2', errors.firstName ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100')}
                      />
                      {errors.firstName && <p className="mt-1 text-[11px] text-red-500">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Last Name *</label>
                      <input
                        type="text" value={form.lastName} onChange={(e) => updateForm('lastName', e.target.value)}
                        className={clsx('w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2', errors.lastName ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100')}
                      />
                      {errors.lastName && <p className="mt-1 text-[11px] text-red-500">{errors.lastName}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                      <input
                        type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)}
                        className={clsx('w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2', errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100')}
                      />
                      {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Phone *</label>
                      <input
                        type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} maxLength={10}
                        className={clsx('w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2', errors.phone ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100')}
                      />
                      {errors.phone && <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth *</label>
                      <input
                        type="date" value={form.dob} onChange={(e) => updateForm('dob', e.target.value)}
                        className={clsx('w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2', errors.dob ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100')}
                      />
                      {errors.dob && <p className="mt-1 text-[11px] text-red-500">{errors.dob}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">PAN Number *</label>
                      <input
                        type="text" value={form.pan} onChange={(e) => updateForm('pan', e.target.value.toUpperCase())} maxLength={10}
                        className={clsx('w-full rounded-lg border px-3 py-2.5 text-sm uppercase outline-none transition focus:ring-2', errors.pan ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100')}
                      />
                      {errors.pan && <p className="mt-1 text-[11px] text-red-500">{errors.pan}</p>}
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
                    <Info className="mt-0.5 h-4 w-4 text-blue-500" />
                    <p className="text-xs text-blue-700">Your information is protected with 256-bit encryption. We never share your data without consent.</p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900">Address & Nominee Details</h2>
                  <p className="mt-1 text-sm text-gray-400">Nominee will receive the policy benefits</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Residential Address *</label>
                      <textarea
                        value={form.address} onChange={(e) => updateForm('address', e.target.value)} rows={2}
                        className={clsx('w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2', errors.address ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100')}
                      />
                      {errors.address && <p className="mt-1 text-[11px] text-red-500">{errors.address}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">City *</label>
                      <input
                        type="text" value={form.city} onChange={(e) => updateForm('city', e.target.value)}
                        className={clsx('w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2', errors.city ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100')}
                      />
                      {errors.city && <p className="mt-1 text-[11px] text-red-500">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Pincode *</label>
                      <input
                        type="text" value={form.pincode} onChange={(e) => updateForm('pincode', e.target.value)} maxLength={6}
                        className={clsx('w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2', errors.pincode ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100')}
                      />
                      {errors.pincode && <p className="mt-1 text-[11px] text-red-500">{errors.pincode}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Nominee Name *</label>
                      <input
                        type="text" value={form.nominee} onChange={(e) => updateForm('nominee', e.target.value)}
                        className={clsx('w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2', errors.nominee ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100')}
                      />
                      {errors.nominee && <p className="mt-1 text-[11px] text-red-500">{errors.nominee}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Relationship with Nominee *</label>
                      <select
                        value={form.relationship} onChange={(e) => updateForm('relationship', e.target.value)}
                        className={clsx('w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2', errors.relationship ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100')}
                      >
                        <option value="">Select</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Child">Child</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.relationship && <p className="mt-1 text-[11px] text-red-500">{errors.relationship}</p>}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900">Select Payment Method</h2>
                  <p className="mt-1 text-sm text-gray-400">Choose your preferred payment option</p>

                  <div className="mt-6 space-y-3">
                    {paymentMethods.map((pm) => (
                      <button
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={clsx(
                          'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition',
                          paymentMethod === pm.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200',
                        )}
                      >
                        <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', paymentMethod === pm.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500')}>
                          <pm.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{pm.label}</p>
                          <p className="text-xs text-gray-400">{pm.desc}</p>
                        </div>
                        {paymentMethod === pm.id && <CheckCircle className="h-5 w-5 text-blue-600" />}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="mt-6 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Card Number</label>
                        <input
                          type="text" placeholder="1234 5678 9012 3456" maxLength={19}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Expiry</label>
                          <input type="text" placeholder="MM/YY" maxLength={5} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                          <input type="password" placeholder="***" maxLength={3} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Lock className="h-3 w-3" /> Your card details are secure and encrypted
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">UPI ID</label>
                      <input
                        type="text" placeholder="example@upi"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                      <p className="mt-2 text-xs text-gray-400">Pay using GPay, PhonePe, Paytm, or any UPI app</p>
                    </div>
                  )}

                  <label className="mt-6 flex items-start gap-3">
                    <input
                      type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-600">
                      I confirm that the information provided is correct and I agree to the{' '}
                      <a href="#" className="text-blue-600 underline">Terms & Conditions</a> and{' '}
                      <a href="#" className="text-blue-600 underline">Privacy Policy</a>.
                    </span>
                  </label>
                </div>
              )}

              {step === 4 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful!</h2>
                    <p className="mt-2 text-gray-500">Your policy has been purchased successfully.</p>
                    <div className="mt-6 rounded-xl bg-blue-50 p-4 text-left">
                      <div className="flex items-center gap-2 text-blue-700">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Policy Reference: POL-{Date.now().toString(36).toUpperCase()}</span>
                      </div>
                      <p className="mt-1 text-xs text-blue-600">An e-policy document will be sent to your email within 5 minutes.</p>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <a href="/policies" className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700">View My Policies</a>
                      <a href="/dashboard" className="rounded-lg border border-gray-200 px-6 py-2.5 font-medium text-gray-600 transition hover:bg-gray-50">Go to Dashboard</a>
                    </div>
                  </div>
                </div>
              )}

              {step < 4 && (
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={handlePrevious}
                    className={clsx(
                      'flex items-center gap-1 rounded-lg px-4 py-2.5 text-sm font-medium transition',
                      step === 1 ? 'invisible' : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <button
                    onClick={step === 3 ? handlePurchase : handleNext}
                    disabled={processing || (step === 3 && !agreed)}
                    className="flex items-center gap-1 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
                  >
                    {step === 3
                      ? (processing ? 'Processing...' : `Pay ₹${grandTotal.toLocaleString()}`)
                      : 'Next'}
                    {!processing && <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-bold text-gray-900">Order Summary</h3>

              <div className="mt-4 rounded-xl bg-gradient-to-br from-blue-50 to-orange-50 p-4">
                <div className="flex items-center gap-3">
                  <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white', getTypeColor(policy.type))}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{policy.name}</p>
                    <p className="text-xs text-gray-500">{policy.provider}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400">Coverage</span><p className="font-medium text-gray-900">{policy.coverage}</p></div>
                  <div><span className="text-gray-400">Tenure</span><p className="font-medium text-gray-900">{policy.tenure}</p></div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base Premium</span>
                  <span className="font-medium text-gray-900">{policy.premium}</span>
                </div>
                {policy.addons.map((a) => (
                  <div key={a.name} className="flex justify-between text-sm">
                    <span className="text-gray-500">{a.name}</span>
                    <span className="font-medium text-gray-900">{a.price}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-900">₹{totalPremium}/month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST (18%)</span>
                    <span className="font-medium text-gray-900">₹{gst}/month</span>
                  </div>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                  <span className="font-bold text-gray-900">Total Monthly</span>
                  <span className="font-bold text-orange-600">₹{grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Annual Equivalent</span>
                  <span>₹{(grandTotal * 12).toLocaleString()}/year</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs font-medium text-green-700">Secure Payment</p>
                  <p className="text-[10px] text-green-600">256-bit SSL encryption</p>
                </div>
              </div>

              <a href={`/chat?policy=${policy?.id}`}
                className="mt-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100">
                <MessageSquare className="h-4 w-4" />
                Chat with Agent about this policy
              </a>

              <div className="mt-4 space-y-1.5 text-xs text-gray-400">
                <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Free look period 15 days</div>
                <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Instant e-policy on payment</div>
                <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Dedicated claim support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
