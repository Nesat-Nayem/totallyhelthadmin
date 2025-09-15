import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MembershipSalesList from './components/MembershipSalesList'

export const metadata: Metadata = { title: 'Membership Sales List' }

const MembershipSalesListPage = () => {
  return (
    <>
      <PageTItle title="Membership Sales List" />
      <MembershipSalesList />
    </>
  )
}

export default MembershipSalesListPage
