import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import PayOutList from './components/PayOutList'

export const metadata: Metadata = { title: 'Pay Out Report' }

const PayOutListPage = () => {
  return (
    <>
      <PageTItle title="Pay Out Report " />
      <PayOutList />
    </>
  )
}

export default PayOutListPage
