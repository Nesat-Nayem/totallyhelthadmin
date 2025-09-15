import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import OnlineSales from './components/OnlineSales'

export const metadata: Metadata = { title: 'Online Report' }

const OnlineSalesListPage = () => {
  return (
    <>
      <PageTItle title="Online Sales Report " />
      <OnlineSales />
    </>
  )
}

export default OnlineSalesListPage
