import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import OnlineMenu from './components/OnlineMenu'

export const metadata: Metadata = { title: 'Online Menu  List' }

const OnlineMenuPage = () => {
  return (
    <>
      <PageTItle title="Online Menu List" />
      <OnlineMenu />
    </>
  )
}

export default OnlineMenuPage
