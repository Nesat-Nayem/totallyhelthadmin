import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import POS from './components/POS'
import TopBarNav from '@/components/layout/TopNavigationBar/components/TopbarNav'

export const metadata: Metadata = { title: 'POS' }

const POSPage = () => {
  return (
    <>
      <TopBarNav />
      <PageTItle title="POS" />
      <POS />
    </>
  )
}

export default POSPage
