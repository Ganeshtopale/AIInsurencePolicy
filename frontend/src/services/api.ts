import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { User, Lead, Policy, ComparisonResult, Purchase } from '@/types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const stored = sessionStorage.getItem('auth-storage')
    if (stored) {
      try {
        const { state } = JSON.parse(stored)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch {
        // ignore parse error
      }
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface LoginPayload {
  email?: string
  password: string
  phone?: string
  username?: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
  username?: string
}

export interface GoogleLoginPayload {
  email: string
  name: string
  google_id: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  token_type: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },

  adminLogin: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/admin-login', payload)
    return data
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  googleLogin: async (payload: GoogleLoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/google', payload)
    return data
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me')
    return data
  },

  updateProfile: async (payload: { name?: string; username?: string; phone?: string; profile_pic?: string; age?: number; city?: string; income?: string; family_size?: number }): Promise<User> => {
    const { data } = await api.put<User>('/auth/profile', payload)
    return data
  },

  changePassword: async (payload: { current_password: string; new_password: string }): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/change-password', payload)
    return data
  },

  forgotPassword: async (payload: { email: string }): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/forgot-password', payload)
    return data
  },

  resetPassword: async (payload: { email: string; otp: string; new_password: string }): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/reset-password', payload)
    return data
  },
}

export const uploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<{ url: string }>('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.url
  },
}

export const profileApi = {
  getPurchases: async (): Promise<Purchase[]> => {
    const { data } = await api.get<Purchase[]>('/profile/purchases')
    return data
  },
}

export interface AgentConversation {
  id: number
  user_id: number
  user_name: string
  agent_id: number | null
  status: string
  created_at: string
  updated_at: string
}

export interface ChatMessageItem {
  id: string
  role: string
  content: string
  created_at: string
}

export interface ChatNotification {
  pending_count: number
  active_count: number
}

export interface ChatResponse {
  message: {
    id: string
    role: string
    content: string
    created_at: string
    metadata?: {
      policies?: Policy[]
      intent?: string
    }
  }
  session_id?: string
  conversation_id?: number
}

export const chatApi = {
  sendMessage: async (payload: {
    message: string
    session_id?: string
  }): Promise<ChatResponse> => {
    const { data } = await api.post<ChatResponse>('/chat/message', payload)
    return data
  },

  getConversations: async (status?: string): Promise<AgentConversation[]> => {
    const params = status ? { status } : {}
    const { data } = await api.get<AgentConversation[]>('/chat/conversations', { params })
    return data
  },

  getConversationMessages: async (convId: number): Promise<ChatMessageItem[]> => {
    const { data } = await api.get<ChatMessageItem[]>(`/chat/conversations/${convId}/messages`)
    return data
  },

  acceptConversation: async (convId: number): Promise<{ message: string }> => {
    const { data } = await api.post(`/chat/conversations/${convId}/accept`)
    return data
  },

  closeConversation: async (convId: number): Promise<{ message: string }> => {
    const { data } = await api.post(`/chat/conversations/${convId}/close`)
    return data
  },

  agentSendMessage: async (convId: number, message: string): Promise<ChatMessageItem> => {
    const { data } = await api.post(`/chat/conversations/${convId}/message`, { message })
    return data
  },

  getNotifications: async (): Promise<ChatNotification> => {
    const { data } = await api.get<ChatNotification>('/chat/notifications')
    return data
  },
}

export const policyApi = {
  getPolicies: async (params?: {
    type?: string
    minCoverage?: number
    maxCoverage?: number
    minAge?: number
    maxAge?: number
    page?: number
    limit?: number
  }): Promise<Policy[]> => {
    const { data } = await api.get<Policy[]>('/policies', { params })
    return data
  },

  getPolicyById: async (id: string): Promise<Policy> => {
    const { data } = await api.get<Policy>(`/policies/${id}`)
    return data
  },

  compareQuotes: async (payload: {
    policyIds: string[]
    userProfile: {
      age: number
      gender: string
      city: string
      income?: number
    }
  }): Promise<ComparisonResult[]> => {
    const { data } = await api.post<ComparisonResult[]>('/policies/compare', payload)
    return data
  },
}

export const leadApi = {
  getLeads: async (params?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Lead>> => {
    const { data } = await api.get<PaginatedResponse<Lead>>('/leads', { params })
    return data
  },

  getLeadById: async (id: string): Promise<Lead> => {
    const { data } = await api.get<Lead>(`/leads/${id}`)
    return data
  },

  createLead: async (payload: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'score'>): Promise<Lead> => {
    const { data } = await api.post<Lead>('/leads', payload)
    return data
  },

  updateLead: async (id: string, payload: Partial<Lead>): Promise<Lead> => {
    const { data } = await api.put<Lead>(`/leads/${id}`, payload)
    return data
  },

  deleteLead: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`)
  },
}

export interface CheckoutOrderResponse {
  order_id: string
  amount: number
  currency: string
  key_id: string
  name: string
  description: string
  prefill_email: string
  prefill_contact: string
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export const checkoutApi = {
  createOrder: async (payload: {
    policy_id: number
    success_url?: string
    cancel_url?: string
  }): Promise<CheckoutOrderResponse> => {
    const { data } = await api.post<CheckoutOrderResponse>('/checkout/create-order', payload)
    return data
  },

  verifyPayment: async (payload: VerifyPaymentPayload): Promise<{ status: string; payment_id: string }> => {
    const { data } = await api.post('/checkout/verify', payload)
    return data
  },
}

export interface PartnerData {
  id: number
  name: string
  brandColor: string
}

export interface CalculatorItemData {
  id: string
  title: string
  description: string
  link: string
}

export interface CalculatorCategoryData {
  category: string
  icon: string
  items: CalculatorItemData[]
}

export interface HomeData {
  partners: PartnerData[]
  calculators: CalculatorCategoryData[]
}

export const homeApi = {
  getHomeData: async (): Promise<HomeData> => {
    const { data } = await api.get<HomeData>('/home')
    return data
  },
}

// --- Admin API ---

export interface DashboardStats {
  total_users: number
  total_policies: number
  total_purchases: number
  total_revenue: number
}

export interface AdminUser {
  id: number
  name: string
  email: string
  phone: string
  username: string | null
  role: string
  is_active: boolean
  created_at: string
}

export interface AdminProvider {
  id: number
  name: string
  logo_url?: string | null
  description?: string | null
  website?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  founded_year?: number | null
  provider_type?: string | null
  rating: number
  is_active: boolean
}

export interface AdminPolicy {
  id: number
  name: string
  provider_id: number
  provider_name: string | null
  provider_logo: string | null
  policy_type: string
  premium: number
  coverage_amount: number
  claim_settlement_ratio?: number | null
  waiting_period?: number | null
  description: string | null
  features?: string[]
  rating: number
  is_active: boolean
  created_at: string
}

export const adminApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/admin/dashboard')
    return data
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const { data } = await api.get<AdminUser[]>('/admin/users')
    return data
  },

  updateUser: async (userId: number, payload: { name?: string; role?: string; is_active?: boolean }): Promise<{ message: string }> => {
    const { data } = await api.put(`/admin/users/${userId}`, payload)
    return data
  },

  deleteUser: async (userId: number): Promise<{ message: string }> => {
    const { data } = await api.delete(`/admin/users/${userId}`)
    return data
  },

  getPolicies: async (): Promise<AdminPolicy[]> => {
    const { data } = await api.get<AdminPolicy[]>('/admin/policies')
    return data
  },

  createPolicy: async (payload: {
    name: string
    provider_id: number
    policy_type: string
    premium: number
    coverage_amount: number
    claim_settlement_ratio?: number | null
    waiting_period?: number | null
    description?: string
    features?: string[]
    rating?: number
  }): Promise<{ id: number; message: string }> => {
    const { data } = await api.post('/admin/policies', payload)
    return data
  },

  listProviders: async (): Promise<AdminProvider[]> => {
    const { data } = await api.get<AdminProvider[]>('/admin/providers')
    return data
  },

  createProvider: async (payload: {
    name: string
    logo_url?: string
    description?: string
    website?: string
    contact_email?: string
    contact_phone?: string
    founded_year?: number
    provider_type?: string
    rating?: number
  }): Promise<AdminProvider> => {
    const { data } = await api.post<AdminProvider>('/admin/providers', payload)
    return data
  },

  updateProvider: async (providerId: number, payload: Record<string, unknown>): Promise<AdminProvider> => {
    const { data } = await api.put<AdminProvider>(`/admin/providers/${providerId}`, payload)
    return data
  },

  deleteProvider: async (providerId: number): Promise<{ message: string }> => {
    const { data } = await api.delete(`/admin/providers/${providerId}`)
    return data
  },

  updatePolicy: async (policyId: number, payload: Record<string, unknown>): Promise<{ message: string }> => {
    const { data } = await api.put(`/admin/policies/${policyId}`, payload)
    return data
  },

  deletePolicy: async (policyId: number): Promise<{ message: string }> => {
    const { data } = await api.delete(`/admin/policies/${policyId}`)
    return data
  },

  listJobs: async (): Promise<Job[]> => {
    const { data } = await api.get<Job[]>('/admin/jobs')
    return data
  },

  listJobApplications: async (): Promise<JobApplication[]> => {
    const { data } = await api.get<JobApplication[]>('/admin/job-applications')
    return data
  },

  updateApplicationStatus: async (appId: number, status: string): Promise<{ message: string }> => {
    const { data } = await api.put(`/admin/job-applications/${appId}`, { status })
    return data
  },

  createAdmin: async (payload: {
    first_name: string
    last_name: string
    email: string
    phone: string
    username: string
    password: string
  }): Promise<{ id: number; message: string }> => {
    const { data } = await api.post('/admin/create-admin', payload)
    return data
  },

  listCustomers: async (): Promise<{ id: number; name: string; email: string; phone: string }[]> => {
    const { data } = await api.get('/admin/customers')
    return data
  },

  purchaseForCustomer: async (payload: { customer_id: number; policy_id: number }): Promise<{ message: string; purchase_id: number }> => {
    const { data } = await api.post('/admin/purchase-for-customer', payload)
    return data
  },
}

export interface Job {
  id: number
  title: string
  department: string
  location: string
  type: string
  description?: string
  requirements?: string
  is_active?: boolean
  created_at?: string
}

export interface JobApplication {
  id: number
  job_id: number
  job_title?: string
  name: string
  email: string
  phone?: string
  resume_url?: string
  cover_letter?: string
  status: string
  created_at?: string
}

export const jobApi = {
  listJobs: async (): Promise<Job[]> => {
    const { data } = await api.get<Job[]>('/jobs')
    return data
  },

  getJob: async (id: number): Promise<Job> => {
    const { data } = await api.get<Job>(`/jobs/${id}`)
    return data
  },

  createJob: async (payload: {
    title: string; department: string; location: string; type: string;
    description?: string; requirements?: string
  }): Promise<{ id: number; message: string }> => {
    const { data } = await api.post('/jobs', payload)
    return data
  },

  updateJob: async (id: number, payload: Partial<Job>): Promise<{ message: string }> => {
    const { data } = await api.put(`/jobs/${id}`, payload)
    return data
  },

  deleteJob: async (id: number): Promise<{ message: string }> => {
    const { data } = await api.delete(`/jobs/${id}`)
    return data
  },

  apply: async (jobId: number, formData: FormData): Promise<{ id: number; message: string }> => {
    const { data } = await api.post(`/jobs/${jobId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}

export const pageApi = {
  getPage: async (pageName: string): Promise<Record<string, unknown>> => {
    const { data } = await api.get(`/pages/${pageName}`)
    return data
  },
}

export default api
