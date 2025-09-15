import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import DailySalesList from './components/DailySalesList'

export const metadata: Metadata = { title: 'Sales Report' }

const DailySalesListPage = () => {
  return (
    <>
      <PageTItle title="Daily Sales Report " />
      <DailySalesList />
    </>
  )
}

export default DailySalesListPage
