import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import InvoiceView from './components/InvoiceView'

export const metadata: Metadata = { title: ' Invoices' }

const InvoicesPage = () => {
  return (
    <>
      <PageTItle title="Invoices" />
      <InvoiceView />
    </>
  )
}

export default InvoicesPage
