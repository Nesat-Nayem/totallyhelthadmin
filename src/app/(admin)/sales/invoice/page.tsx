import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Invoice from './components/Invoice'

export const metadata: Metadata = { title: 'Invoice' }

const InvoiceListPage = () => {
  return (
    <>
      <PageTItle title="Invoice List" />
      <Invoice />
    </>
  )
}

export default InvoiceListPage
