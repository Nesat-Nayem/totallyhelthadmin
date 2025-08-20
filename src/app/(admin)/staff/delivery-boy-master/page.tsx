import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import DeliveryBoyList from './components/DeliveryBoyList'

export const metadata: Metadata = { title: 'Delivery Boy  List' }

const DeliveryBoyListPage = () => {
  return (
    <>
      <PageTItle title="Delivery Boy List" />
      <DeliveryBoyList />
    </>
  )
}

export default DeliveryBoyListPage
