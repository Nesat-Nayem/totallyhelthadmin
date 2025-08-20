import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VatReport from './components/VatReport'

export const metadata: Metadata = { title: 'VAT Report' }

const VatListPage = () => {
  return (
    <>
      <PageTItle title="VAT Report " />
      <VatReport />
    </>
  )
}

export default VatListPage
