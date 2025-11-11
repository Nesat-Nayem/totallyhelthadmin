import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SupplierForm from '../components/SupplierForm'

export const metadata: Metadata = { title: 'Add Supplier' }

const AddSupplierPage = () => {
  return (
    <>
      <PageTItle title="Add Supplier" />
      <SupplierForm />
    </>
  )
}

export default AddSupplierPage

