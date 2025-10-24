'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Suspense } from 'react'
import LeftSideBarToggle from './components/LeftSideBarToggle'
import Notifications from './components/Notifications'
import ProfileDropdown from './components/ProfileDropdown'
import ThemeCustomizerToggle from './components/ThemeCustomizerToggle'
import ThemeModeToggle from './components/ThemeModeToggle'
import TopBarTitle from './components/TopBarTitle'
import { Button, Dropdown } from 'react-bootstrap'
import Link from 'next/link'
import { useAccessControl } from '@/hooks/useAccessControl'

const page = () => {
  const { hasPOSAccess, accessiblePOSOptions } = useAccessControl()

  return (
    <header className="topbar">
      <div className="container-fluid">
        <div className="navbar-header">
          <div className="d-flex align-items-center">
            <LeftSideBarToggle />
            <TopBarTitle />
          </div>
          <div className="d-flex align-items-center gap-1">
            {/* Dynamic POS Button - Direct Link */}
            {hasPOSAccess && (
              <Link href="/pos" className="btn btn-sm btn-info">
                <IconifyIcon icon="mdi:cart-outline" /> POS
              </Link>
            )}
            <Link href="/dashboard" className="btn btn-sm btn-dark">
              <IconifyIcon icon="mdi:view-dashboard-outline" /> Dashboard
            </Link>
            <ThemeModeToggle />

            <Suspense>
              <Notifications />
            </Suspense>

            <ThemeCustomizerToggle />

            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  )
}

export default page
