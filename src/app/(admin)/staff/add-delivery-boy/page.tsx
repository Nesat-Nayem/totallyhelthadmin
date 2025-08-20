import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import DeliveryAdd from './components/DeliveryAdd'

export const metadata: Metadata = { title: 'Delivery Boy Add' }

const DeliveryAddPage = () => {
  return (
    <>
      <PageTItle title="Delivery Boy ADD" />
      <DeliveryAdd />
    </>
  )
}

export default DeliveryAddPage
