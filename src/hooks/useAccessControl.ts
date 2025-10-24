'use client'

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { 
  UserSession, 
  getAccessibleMenuItems, 
  canAccessRoute, 
  getAccessibleRoutes,
  hasModuleAccess,
  hasSubModuleAccess,
  hasAnyModuleAccess,
  hasPOSModuleAccess,
  getAccessiblePOSOptions,
  hasPOSButtonAccess
} from '@/utils/accessControl'
import { MenuItemType } from '@/types/menu'

/**
 * Custom hook for role-based access control
 * Provides easy access to user permissions and filtered menu items
 */
export const useAccessControl = () => {
  const { data: session, status } = useSession()

  // Convert NextAuth session to our UserSession format
  const userSession: UserSession | null = useMemo(() => {
    if (!session?.user) return null

    return {
      email: session.user.email || '',
      name: session.user.name || '',
      role: (session.user as any).role || '',
      branchId: (session.user as any).branchId || '',
      menuAccess: (session.user as any).menuAccess || {}
    }
  }, [session])

  // Get accessible menu items based on user permissions
  const accessibleMenuItems: MenuItemType[] = useMemo(() => {
    return getAccessibleMenuItems(userSession)
  }, [userSession])

  // Get accessible routes for navigation guards
  const accessibleRoutes: string[] = useMemo(() => {
    return getAccessibleRoutes(userSession)
  }, [userSession])

  // Get POS module access
  const hasPOSAccess: boolean = useMemo(() => {
    return hasPOSModuleAccess(userSession)
  }, [userSession])

  // Get accessible POS options
  const accessiblePOSOptions = useMemo(() => {
    return getAccessiblePOSOptions(userSession)
  }, [userSession])

  // Check if user has access to a specific module
  const hasAccessToModule = (moduleKey: string): boolean => {
    if (!userSession) return false
    return hasModuleAccess(userSession.menuAccess, moduleKey)
  }

  // Check if user has access to a specific sub-module
  const hasAccessToSubModule = (moduleKey: string, subModuleKey: string): boolean => {
    if (!userSession) return false
    return hasSubModuleAccess(userSession.menuAccess, moduleKey, subModuleKey)
  }

  // Check if user has any access to a module (direct or through children)
  const hasAnyAccessToModule = (moduleKey: string): boolean => {
    if (!userSession) return false
    return hasAnyModuleAccess(userSession.menuAccess, moduleKey)
  }

  // Check if user can access a specific route
  const canAccess = (routePath: string): boolean => {
    return canAccessRoute(userSession, routePath)
  }

  // Check if user has access to a specific POS button
  const hasAccessToPOSButton = (buttonKey: string): boolean => {
    return hasPOSButtonAccess(userSession, buttonKey)
  }

  // Check if user is authenticated
  const isAuthenticated = status === 'authenticated'

  // Check if user is loading
  const isLoading = status === 'loading'

  // Get user role
  const userRole = userSession?.role || ''

  // Check if user is admin or super admin
  const isAdmin = userRole === 'admin' || userRole === 'superadmin'

  return {
    // User session data
    userSession,
    isAuthenticated,
    isLoading,
    userRole,
    isAdmin,

    // Menu access
    accessibleMenuItems,
    accessibleRoutes,

    // POS module access
    hasPOSAccess,
    accessiblePOSOptions,

    // Access control functions
    hasAccessToModule,
    hasAccessToSubModule,
    hasAnyAccessToModule,
    canAccess,
    hasAccessToPOSButton,

    // Utility functions
    hasModuleAccess: (moduleKey: string) => hasAccessToModule(moduleKey),
    hasSubModuleAccess: (moduleKey: string, subModuleKey: string) => hasAccessToSubModule(moduleKey, subModuleKey),
    canAccessRoute: (routePath: string) => canAccess(routePath)
  }
}

export default useAccessControl
