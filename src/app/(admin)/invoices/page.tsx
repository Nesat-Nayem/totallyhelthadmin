import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Invoices from './components/Invoices'

export const metadata: Metadata = { title: ' Invoices' }

const InvoicesPage = () => {
  return (
    <>
      <PageTItle title="Invoices" />
      <Invoices />
    </>
  )
}

export default InvoicesPage
