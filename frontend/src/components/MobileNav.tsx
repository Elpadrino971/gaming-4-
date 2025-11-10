'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Gamepad2, Trophy, Gift, User } from 'lucide-react'
import { motion } from 'framer-motion'

interface NavItem {
  icon: any
  label: string
  href: string
  badge?: number
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Accueil', href: '/dashboard' },
  { icon: Gamepad2, label: 'Jouer', href: '/lobby' },
  { icon: Trophy, label: 'Tournois', href: '/achievements' },
  { icon: Gift, label: 'Roue', href: '/wheel' },
  { icon: User, label: 'Profil', href: '/profile' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  // Don't show on login/register pages
  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <motion.button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center justify-center flex-1 relative min-h-[44px]"
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-1 font-medium transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -top-[1px] left-1/2 w-12 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ transform: 'translateX(-50%)' }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
