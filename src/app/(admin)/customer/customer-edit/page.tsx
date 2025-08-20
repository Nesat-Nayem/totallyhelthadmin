import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CustomerEdit from './components/CustomerEdit'

export const metadata: Metadata = { title: 'Customer Edit' }

const CustomerEditPage = () => {
  return (
    <>
      <PageTItle title="CUSTOMER EDIT" />
      <CustomerEdit />
    </>
  )
}

export default CustomerEditPage
