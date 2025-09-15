import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SalesList from './components/SalesList'

export const metadata: Metadata = { title: 'Sales Report' }

const SalesListPage = () => {
  return (
    <>
      <PageTItle title="Sales Report " />
      <SalesList />
    </>
  )
}

export default SalesListPage
