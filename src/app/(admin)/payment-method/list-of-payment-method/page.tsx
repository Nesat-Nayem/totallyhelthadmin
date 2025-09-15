import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'

import ListOfPaymentMethod from './components/ListOfPaymentMethod'

export const metadata: Metadata = { title: 'List Of Payment Menthod' }

const ListOfPaymentMethodPage = () => {
  return (
    <>
      <PageTItle title=" List Of Payment Menthod" />
      <ListOfPaymentMethod />
    </>
  )
}

export default ListOfPaymentMethodPage
