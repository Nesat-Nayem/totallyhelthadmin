import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EditNewPaymentMethod from './components/EditNewPaymentMethod'

export const metadata: Metadata = { title: 'Edit New Payment Method' }

const EditNewPaymentMethodPage = () => {
  return (
    <>
      <PageTItle title="Edit New Payment Method " />
      <EditNewPaymentMethod />
    </>
  )
}

export default EditNewPaymentMethodPage
