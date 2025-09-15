import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AddNewPaymentMethod from './components/AddNewPaymentMethod'

export const metadata: Metadata = { title: 'Add New Payment Method' }

const AddNewPaymentMethodPage = () => {
  return (
    <>
      <PageTItle title="Add New Payment Method " />
      <AddNewPaymentMethod />
    </>
  )
}

export default AddNewPaymentMethodPage
