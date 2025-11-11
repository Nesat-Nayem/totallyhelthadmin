import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SupplierForm from '../../components/SupplierForm'

export const metadata: Metadata = { title: 'Edit Supplier' }

const EditSupplierPage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTItle title="Edit Supplier" />
      <SupplierForm id={params.id} />
    </>
  )
}

export default EditSupplierPage

