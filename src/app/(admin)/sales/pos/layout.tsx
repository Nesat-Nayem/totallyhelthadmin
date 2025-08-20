'use client'

import VerticalNavigationBarPage from '@/components/layout/VerticalNavigationBar/page'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPosPage = pathname === '/sales/pos'

  return (
    <div className={`app-container ${isPosPage ? 'no-sidebar' : ''}`}>
      {!isPosPage && <VerticalNavigationBarPage />}
      <main className={`main-content ${isPosPage ? 'full-width' : ''}`}>{children}</main>
    </div>
  )
}
