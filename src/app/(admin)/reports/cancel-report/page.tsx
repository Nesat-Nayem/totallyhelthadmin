import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CancelSalesList from './components/CancelSalesList'

export const metadata: Metadata = { title: 'Cancel Sales Report' }

const CancelSalesListPage = () => {
  return (
    <>
      <PageTItle title="Cancel Sales Report " />
      <CancelSalesList />
    </>
  )
}

export default CancelSalesListPage
