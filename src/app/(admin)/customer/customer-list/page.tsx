import React from 'react'
import CustomerDataList from './components/CustomerDataList'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Customer' }

const CustomerPage = () => {
  return (
    <>
      <PageTItle title="CUSTOMER LIST" />
      <CustomerDataList />
    </>
  )
}

export default CustomerPage
