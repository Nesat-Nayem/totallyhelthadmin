import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SalesList from './components/SalesList'

export const metadata: Metadata = { title: 'Sales List' }

const SalesListPage = () => {
  return (
    <>
      <PageTItle title="Sales List" />
      <SalesList />
    </>
  )
}

export default SalesListPage
