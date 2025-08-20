import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantsBanner from './components/RestaurantsBanner'

export const metadata: Metadata = { title: 'Restaurants Banner' }

const RestaurantsBannerPage = () => {
  return (
    <>
      <PageTItle title="Restaurants Banner" />
      <RestaurantsBanner />
    </>
  )
}

export default RestaurantsBannerPage
