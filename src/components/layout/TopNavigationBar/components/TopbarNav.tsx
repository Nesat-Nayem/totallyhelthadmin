'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Suspense, use } from 'react'
import { Button, Dropdown } from 'react-bootstrap'
import Link from 'next/link'
import LeftSideBarToggle from './LeftSideBarToggle'
import TopBarTitle from './TopBarTitle'
import ThemeModeToggle from './ThemeModeToggle'
import Notifications from './Notifications'
import ThemeCustomizerToggle from './ThemeCustomizerToggle'
import ProfileDropdown from './ProfileDropdown'
import { useRouter } from 'next/navigation'
import { useAccessControl } from '@/hooks/useAccessControl'

const TopBarNav = () => {
  const router = useRouter()
  const { hasPOSAccess, accessiblePOSOptions } = useAccessControl()

  return (
    <header className="topbar p-0">
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          {/* Left: Title (visible on md and up) */}
          <div className="d-none d-md-flex align-items-center">
            <TopBarTitle />
          </div>

          {/* Right: Buttons & Toggles */}
          <div className="d-flex align-items-center flex-wrap gap-2 justify-content-end w-100 w-md-auto">
            {/* Dynamic POS Button - Direct Link */}
            {hasPOSAccess && (
              <Link href="/pos" className="btn btn-sm btn-info d-flex align-items-center gap-1">
                <IconifyIcon icon="mdi:cart-outline" />
                <span className="d-none d-sm-inline">POS</span>
              </Link>
            )}

            <Link href="/dashboard" className="btn btn-sm btn-dark d-flex align-items-center gap-1">
              <IconifyIcon icon="mdi:view-dashboard-outline" />
              <span className="d-none d-sm-inline">Dashboard</span>
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

export default TopBarNav
