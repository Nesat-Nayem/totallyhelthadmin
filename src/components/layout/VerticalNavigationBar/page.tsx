'use client'

import FallbackLoading from '@/components/FallbackLoading'
import LogoBox from '@/components/LogoBox'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { getMenuItemsByAccess } from '@/helpers/Manu'
import { Suspense } from 'react'
import AppMenu from './components/AppMenu'
import HoverMenuToggle from './components/HoverMenuToggle'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useAccessControl } from '@/hooks/useAccessControl'

const VerticalNavigationBarPage = () => {
  const pathname = usePathname()
  const { userSession, isLoading } = useAccessControl()

  // Hide sidebar on /sales/pos route
  const hideSidebarRoutes = ['/sales/pos']
  const isSidebarHidden = hideSidebarRoutes.includes(pathname)

  if (isSidebarHidden) return null

  // Get menu items filtered by user access permissions
  const menuItems = getMenuItemsByAccess(userSession)

  // Show loading state while session is loading
  if (isLoading) {
    return (
      <div className="main-nav">
        <LogoBox />
        <HoverMenuToggle />
        <SimplebarReactClient className="scrollbar" data-simplebar>
          <Suspense fallback={<FallbackLoading />}>
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </Suspense>
        </SimplebarReactClient>
      </div>
    )
  }

  return (
    <div className="main-nav">
      <LogoBox />
      <HoverMenuToggle />
      <SimplebarReactClient className="scrollbar" data-simplebar>
        <Suspense fallback={<FallbackLoading />}>
          <AppMenu menuItems={menuItems} />
        </Suspense>
      </SimplebarReactClient>
    </div>
  )
}

export default VerticalNavigationBarPage
