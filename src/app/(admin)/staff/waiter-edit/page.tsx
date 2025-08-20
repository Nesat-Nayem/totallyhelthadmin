import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import WaiterEdit from './components/WaiterEdit'

export const metadata: Metadata = { title: 'Waiter Edit' }

const WaiterEditPage = () => {
  return (
    <>
      <PageTItle title="Waiter Edit" />
      <WaiterEdit />
    </>
  )
}

export default WaiterEditPage
