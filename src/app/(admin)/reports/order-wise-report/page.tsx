import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CategoryListReport from './components/OrderList'
import OrderList from './components/OrderList'

export const metadata: Metadata = { title: 'Order Report' }

const OrderListPage = () => {
  return (
    <>
      <PageTItle title="Order Report " />
      <OrderList />
    </>
  )
}

export default OrderListPage
