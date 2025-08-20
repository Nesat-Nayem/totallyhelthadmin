import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CustomerAdd from './components/WaiterAdd'
import WaiterAdd from './components/WaiterAdd'

export const metadata: Metadata = { title: 'Waiter Add' }

const WaiterAddPage = () => {
  return (
    <>
      <PageTItle title="Waiter ADD" />
      <WaiterAdd />
    </>
  )
}

export default WaiterAddPage
