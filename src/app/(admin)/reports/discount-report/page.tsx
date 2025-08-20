import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VatReport from './components/DiscountList'
import DiscountList from './components/DiscountList'

export const metadata: Metadata = { title: 'Discount Report' }

const DiscountListPage = () => {
  return (
    <>
      <PageTItle title="Discount Report " />
      <DiscountList />
    </>
  )
}

export default DiscountListPage
