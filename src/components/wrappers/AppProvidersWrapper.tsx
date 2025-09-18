'use client'
import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { DEFAULT_PAGE_TITLE } from '@/context/constants'
import { ChildrenType } from '@/types/component-props'
import dynamic from 'next/dynamic'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { useSession } from 'next-auth/react'
const LayoutProvider = dynamic(() => import('@/context/useLayoutContext').then((mod) => mod.LayoutProvider), {
  ssr: false,
})
import { NotificationProvider } from '@/context/useNotificationContext'
import { TitleProvider } from '@/context/useTitleContext'

const LocalAuthSync = () => {
  const { data } = useSession()
  useEffect(() => {
    try {
      const accessToken = (data as any)?.accessToken
      if (accessToken) {
        localStorage.setItem('backend_token', accessToken as string)
      } else {
        localStorage.removeItem('backend_token')
      }
    } catch {}
  }, [data])
  return null
}

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  const handleChangeTitle = () => {
    if (document.visibilityState == 'hidden') document.title = 'Please come back 🥺'
    else document.title = DEFAULT_PAGE_TITLE
  }

  useEffect(() => {
    if (document) {
      const e = document.querySelector<HTMLDivElement>('#__next_splash')
      if (e?.hasChildNodes()) {
        document.querySelector('#splash-screen')?.classList.add('remove')
      }
      e?.addEventListener('DOMNodeInserted', () => {
        document.querySelector('#splash-screen')?.classList.add('remove')
      })
    }

    document.addEventListener('visibilitychange', handleChangeTitle)
    return () => {
      document.removeEventListener('visibilitychange', handleChangeTitle)
    }
  }, [])

  return (
    <SessionProvider>
      <Provider store={store}>
        <LayoutProvider>
          <TitleProvider>
            <NotificationProvider>
              <LocalAuthSync />
              {children}
              <ToastContainer theme="colored" />
            </NotificationProvider>
          </TitleProvider>
        </LayoutProvider>
      </Provider>
    </SessionProvider>
  )
}
export default AppProvidersWrapper
