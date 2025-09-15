import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CustomerMenbershipList from './components/CustomerMenbershipList'

export const metadata: Metadata = { title: 'Customer Membership History' }

const CustomerMenbershipListPage = () => {
  return (
    <>
      <PageTItle title="Customer Membership History" />
      <CustomerMenbershipList />
    </>
  )
}

export default CustomerMenbershipListPage
