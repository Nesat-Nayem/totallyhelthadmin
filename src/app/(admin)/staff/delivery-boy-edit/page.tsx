import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import DeliveryEdit from './components/DeliveryEdit'

export const metadata: Metadata = { title: 'Delivery Boy Edit' }

const DeliveryEditPage = () => {
  return (
    <>
      <PageTItle title="Delivery Boy Edit" />
      <DeliveryEdit />
    </>
  )
}

export default DeliveryEditPage
