import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  verify: () => api.get('/auth/verify'),
}

// Users API
export const usersAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data: any) => api.put('/users/me', data),
  getStats: () => api.get('/users/me/stats'),
  getReferrals: () => api.get('/users/me/referrals'),
}

// Credits API
export const creditsAPI = {
  getBalance: () => api.get('/credits/balance'),
  getTransactions: (params?: any) => api.get('/credits/transactions', { params }),
  getStats: () => api.get('/credits/stats'),
}

// Shop API
export const shopAPI = {
  getProducts: (category?: string) => api.get('/shop/products', { params: { category } }),
  getProductById: (id: string) => api.get(`/shop/products/${id}`),
  getCategories: () => api.get('/shop/categories'),
  createOrder: (data: any) => api.post('/shop/orders', data),
  getUserOrders: () => api.get('/shop/orders'),
  getOrderById: (id: string) => api.get(`/shop/orders/${id}`),
}

// Games API
export const gamesAPI = {
  getAvailableGames: () => api.get('/games/available'),
  createGame: (data?: any) => api.post('/games/create', data),
  getGameById: (id: string) => api.get(`/games/${id}`),
  getUserGames: () => api.get('/games/user/history'),
}

// Payments API
export const paymentsAPI = {
  getCreditPackages: () => api.get('/payments/credit-packages'),
  createPaymentIntent: (data: any) => api.post('/payments/create-intent', data),
}

// Missions API
export const missionsAPI = {
  getUserMissions: () => api.get('/missions'),
  claimReward: (missionId: string) => api.post(`/missions/${missionId}/claim`),
  getMissionStats: () => api.get('/missions/stats'),
}

// VIP API
export const vipAPI = {
  getBenefits: () => api.get('/vip/benefits'),
  subscribe: (data: any) => api.post('/vip/subscribe', data),
  cancelSubscription: () => api.post('/vip/cancel'),
  getSubscription: () => api.get('/vip/subscription'),
}

// Referrals API
export const referralsAPI = {
  getMyCode: () => api.get('/referrals/my-code'),
  getStats: () => api.get('/referrals/stats'),
  getLeaderboard: (limit?: number) => api.get('/referrals/leaderboard', { params: { limit } }),
}

// Daily Wheel API
export const wheelAPI = {
  canSpin: () => api.get('/wheel/can-spin'),
  spin: () => api.post('/wheel/spin'),
  getHistory: (limit?: number) => api.get('/wheel/history', { params: { limit } }),
  getConfig: () => api.get('/wheel/config'),
}

// Achievements API
export const achievementsAPI = {
  getMy: () => api.get('/achievements/my'),
  getAll: () => api.get('/achievements/all'),
}

// Tournaments API
export const tournamentsAPI = {
  getActive: () => api.get('/tournaments'),
  register: (tournamentId: string) => api.post(`/tournaments/${tournamentId}/register`),
  getLeaderboard: (tournamentId: string) => api.get(`/tournaments/${tournamentId}/leaderboard`),
}

// Battle Pass API
export const battlePassAPI = {
  getCurrent: () => api.get('/battle-pass/current'),
  getMyProgress: () => api.get('/battle-pass/my-progress'),
  purchase: () => api.post('/battle-pass/purchase'),
  claimReward: (tier: number) => api.post(`/battle-pass/claim/${tier}`),
}

// Cosmetics API
export const cosmeticsAPI = {
  getAll: (type?: string) => api.get('/cosmetics', { params: { type } }),
  getMy: () => api.get('/cosmetics/my'),
  purchase: (cosmeticId: string) => api.post(`/cosmetics/${cosmeticId}/purchase`),
  equip: (cosmeticId: string) => api.post(`/cosmetics/${cosmeticId}/equip`),
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getFinancialDashboard: (days?: number) => api.get('/admin/financial', { params: { days } }),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrder: (id: string, data: any) => api.put(`/admin/orders/${id}`, data),
  getProducts: () => api.get('/admin/products'),
  updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
  getGames: (params?: any) => api.get('/admin/games', { params }),
}
