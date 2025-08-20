import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CustomerAdd from './components/CustomerAdd'

export const metadata: Metadata = { title: 'Customer Add' }

const CustomerAddPage = () => {
  return (
    <>
      <PageTItle title="CUSTOMER ADD" />
      <CustomerAdd />
    </>
  )
}

export default CustomerAddPage
