/**
 * Development mode helper
 * Set DEV_MODE=true to bypass authentication
 */

export const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || true // Force dev mode

export const DEV_USER = {
  id: 'dev-user-123',
  email: 'dev@bingoshop.com',
  username: 'DevPlayer',
  credits: 10000,
  xp: 5000,
  level: 'GOLD',
  isVip: true,
  loginStreak: 7,
  maxStreak: 15,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const isDevelopment = () => {
  return DEV_MODE || process.env.NODE_ENV === 'development'
}
