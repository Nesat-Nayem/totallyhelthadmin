import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantSalesList from './components/RestaurantSalesList'

export const metadata: Metadata = { title: 'Sales Report' }

const RestaurantSalesListPage = () => {
  return (
    <>
      <PageTItle title="Restaurant Sales Report " />
      <RestaurantSalesList />
    </>
  )
}

export default RestaurantSalesListPage
