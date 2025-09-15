import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SupplierList from './components/SupplierList'

export const metadata: Metadata = { title: 'Supplier List' }

const SupplierListPage = () => {
  return (
    <>
      <PageTItle title="Supplier List" />
      <SupplierList />
    </>
  )
}

export default SupplierListPage
