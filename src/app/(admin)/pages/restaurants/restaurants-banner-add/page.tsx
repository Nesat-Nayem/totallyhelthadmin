import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantsBannerAdd from './components/RestaurantsBannerAdd'

export const metadata: Metadata = { title: 'Restaurants Banner Add' }

const RestaurantsBannerAddPage = () => {
  return (
    <>
      <PageTItle title="Restaurants Banner Add" />
      <RestaurantsBannerAdd />
    </>
  )
}

export default RestaurantsBannerAddPage
