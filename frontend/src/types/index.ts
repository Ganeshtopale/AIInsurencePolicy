export interface User {
  id: number
  email: string
  name: string
  username?: string
  phone?: string
  profile_pic?: string
  role: string
  is_active: boolean
  age?: number | null
  city?: string | null
  income?: string | null
  family_size?: number | null
}

export interface Lead {
  id: string
  userId?: string
  name: string
  email: string
  phone: string
  age: number
  gender: 'male' | 'female' | 'other'
  city: string
  state: string
  income?: number
  occupation?: string
  insuranceType: InsuranceType
  coverageAmount?: number
  tenure?: number
  status: LeadStatus
  score?: LeadScore
  notes?: string
  createdAt: string
  updatedAt: string
}

export type InsuranceType =
  | 'health'
  | 'life'
  | 'auto'
  | 'home'
  | 'travel'
  | 'term'
  | 'critical-illness'
  | 'accident'

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'closed'

export interface Policy {
  id: string
  name: string
  provider: string
  provider_name?: string
  provider_logo?: string | null
  type: InsuranceType
  description: string
  coverage: string[]
  benefits: string[]
  premium: number
  premiumFrequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
  coverageAmount: number
  tenure: number
  ageMin: number
  ageMax: number
  rating: number
  claimSettlementRatio: number
  features: string[]
  terms: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  id: string
  userId?: string
  title: string
  messages: ChatMessage[]
  context: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: {
    policies?: Policy[]
    comparison?: ComparisonResult[]
    intent?: string
    confidence?: number
  }
  createdAt: string
}

export interface ComparisonResult {
  policyId: string
  policy: Policy
  score: number
  strengths: string[]
  weaknesses: string[]
  matchReason: string
}

export interface Provider {
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

export interface Partner {
  id: number
  name: string
  brandColor: string
}

export interface CalculatorItem {
  id: string
  title: string
  description: string
  link: string
}

export interface CalculatorCategory {
  category: string
  icon: string
  items: CalculatorItem[]
}

export interface LeadScore {
  overall: number
  intent: number
  affordability: number
  urgency: number
  trust: number
  engagement: number
  breakdown: {
    category: string
    score: number
    maxScore: number
    weight: number
  }[]
}

export interface Purchase {
  id: number
  policy_name: string
  amount: number
  tenure: number
  status: string
  created_at: string
}
