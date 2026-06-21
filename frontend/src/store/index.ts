import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, ChatMessage } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User) => void
}

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  conversationId: string | null
  addMessage: (message: ChatMessage) => void
  setMessages: (messages: ChatMessage[]) => void
  setIsLoading: (loading: boolean) => void
  setConversationId: (id: string) => void
  clearMessages: () => void
}

interface UIState {
  sidebarOpen: boolean
  chatDrawerOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleChatDrawer: () => void
  setChatDrawerOpen: (open: boolean) => void
}

const sessionStorageAdapter = {
  getItem: (name: string) => {
    const raw = sessionStorage.getItem(name)
    return raw ? JSON.parse(raw) : null
  },
  setItem: (name: string, value: unknown) => {
    sessionStorage.setItem(name, JSON.stringify(value))
  },
  removeItem: (name: string) => {
    sessionStorage.removeItem(name)
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () => {
        sessionStorage.removeItem('auth-storage')
        set({ user: null, token: null, isAuthenticated: false })
        window.location.href = '/'
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      storage: sessionStorageAdapter,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  isLoading: false,
  conversationId: null,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setConversationId: (id) => set({ conversationId: id }),
  clearMessages: () => set({ messages: [], conversationId: null }),
}))

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  chatDrawerOpen: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleChatDrawer: () =>
    set((state) => ({ chatDrawerOpen: !state.chatDrawerOpen })),
  setChatDrawerOpen: (open) => set({ chatDrawerOpen: open }),
}))
