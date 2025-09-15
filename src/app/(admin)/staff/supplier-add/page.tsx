import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SupplierAdd from './components/SupplierAdd'

export const metadata: Metadata = { title: 'Supplier Add' }

const SupplierAddPage = () => {
  return (
    <>
      <PageTItle title="Supplier ADD" />
      <SupplierAdd />
    </>
  )
}

export default SupplierAddPage
