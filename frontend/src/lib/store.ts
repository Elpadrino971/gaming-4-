import { create } from 'zustand'

interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  role: string
  level: string
  credits: number
  xp: number
  totalGamesPlayed: number
  totalWins: number
  referralCode: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  updateCredits: (credits: number) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
    set({ token })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateCredits: (credits) => set((state) => ({
    user: state.user ? { ...state.user, credits } : null,
  })),
}))

interface GameStore {
  currentGame: any | null
  setCurrentGame: (game: any) => void
  clearCurrentGame: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  currentGame: null,
  setCurrentGame: (game) => set({ currentGame: game }),
  clearCurrentGame: () => set({ currentGame: null }),
}))
