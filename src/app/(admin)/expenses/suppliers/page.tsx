import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SupplierList from './components/SupplierList'

export const metadata: Metadata = { title: 'Suppliers' }

const SupplierPage = () => {
  return (
    <>
      <PageTItle title="Suppliers" />
      <SupplierList />
    </>
  )
}

export default SupplierPage

