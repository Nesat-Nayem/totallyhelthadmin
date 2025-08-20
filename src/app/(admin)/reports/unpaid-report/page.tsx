import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import UnpaidList from './components/UnpaidList'

export const metadata: Metadata = { title: 'Unpaid Report' }

const UnpaidListPage = () => {
  return (
    <>
      <PageTItle title="Unpaid Report " />
      <UnpaidList />
    </>
  )
}

export default UnpaidListPage
