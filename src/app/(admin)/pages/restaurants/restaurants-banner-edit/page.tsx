import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantsBannerEdit from './components/RestaurantsBannerEdit'

export const metadata: Metadata = { title: 'Restaurants Banner Edit' }

const RestaurantsBannerEditPage = () => {
  return (
    <>
      <PageTItle title="Restaurants Banner Edit" />
      <RestaurantsBannerEdit />
    </>
  )
}

export default RestaurantsBannerEditPage
