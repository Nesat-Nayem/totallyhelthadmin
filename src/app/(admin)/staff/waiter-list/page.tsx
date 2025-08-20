import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import WaiterList from './components/WaiterList'

export const metadata: Metadata = { title: 'Waiter List' }

const WaiterListPage = () => {
  return (
    <>
      <PageTItle title="Waiter LIST" />
      <WaiterList />
    </>
  )
}

export default WaiterListPage
