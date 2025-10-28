'use client'

import { useAccessControl } from '@/hooks/useAccessControl'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import FallbackLoading from '@/components/FallbackLoading'

interface AccessGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

/**
 * Component that guards routes based on user access permissions
 * Automatically redirects users who don't have access to the current route
 */
export const AccessGuard: React.FC<AccessGuardProps> = ({ 
  children, 
  fallback = <FallbackLoading />,
  redirectTo = '/dashboard'
}) => {
  const { canAccess, isAuthenticated, isLoading, userSession } = useAccessControl()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Don't check access while loading or if not authenticated
    if (isLoading || !isAuthenticated) return

    // Allow access to auth pages
    if (pathname.startsWith('/auth/')) return

    // Allow access to public pages
    const publicRoutes = ['/', '/dashboard', '/pos']
    if (publicRoutes.includes(pathname)) return

    // Check if user has access to current route
    if (!canAccess(pathname)) {
      console.warn(`Access denied for route: ${pathname}`)
      router.push(redirectTo)
    }
  }, [pathname, canAccess, isAuthenticated, isLoading, router, redirectTo])

  // Show loading while checking authentication
  if (isLoading) {
    return <>{fallback}</>
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  // Allow access to auth pages without checking permissions
  if (pathname.startsWith('/auth/')) {
    return <>{children}</>
  }

  // Allow access to public routes
  const publicRoutes = ['/', '/dashboard', '/pos']
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // Check if user has access to current route
  if (!canAccess(pathname)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default AccessGuard
