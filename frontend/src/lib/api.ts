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
