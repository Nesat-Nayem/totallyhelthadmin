import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SupplierEdit from './components/SupplierEdit'

export const metadata: Metadata = { title: 'Supplier Edit' }

const SupplierEditPage = () => {
  return (
    <>
      <PageTItle title="Supplier Edit" />
      <SupplierEdit />
    </>
  )
}

export default SupplierEditPage
