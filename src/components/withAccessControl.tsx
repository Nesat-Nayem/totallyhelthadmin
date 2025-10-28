'use client'

import { useAccessControl } from '@/hooks/useAccessControl'
import { ComponentType } from 'react'

interface AccessControlOptions {
  moduleKey?: string
  subModuleKey?: string
  routePath?: string
  fallback?: React.ReactNode
  redirectTo?: string
}

/**
 * Higher-order component that wraps components with access control
 * @param WrappedComponent - The component to wrap
 * @param options - Access control options
 * @returns Wrapped component with access control
 */
export function withAccessControl<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: AccessControlOptions = {}
) {
  const {
    moduleKey,
    subModuleKey,
    routePath,
    fallback = <div className="text-center p-4">Access Denied</div>,
    redirectTo = '/dashboard'
  } = options

  const AccessControlledComponent = (props: P) => {
    const { 
      hasAccessToModule, 
      hasAccessToSubModule, 
      canAccess, 
      isAuthenticated, 
      isLoading 
    } = useAccessControl()

    // Show loading while checking authentication
    if (isLoading) {
      return <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
      return <>{fallback}</>
    }

    // Check access based on provided options
    let hasAccess = true

    if (moduleKey && subModuleKey) {
      hasAccess = hasAccessToSubModule(moduleKey, subModuleKey)
    } else if (moduleKey) {
      hasAccess = hasAccessToModule(moduleKey)
    } else if (routePath) {
      hasAccess = canAccess(routePath)
    }

    if (!hasAccess) {
      return <>{fallback}</>
    }

    return <WrappedComponent {...props} />
  }

  // Set display name for debugging
  AccessControlledComponent.displayName = `withAccessControl(${WrappedComponent.displayName || WrappedComponent.name})`

  return AccessControlledComponent
}

export default withAccessControl
