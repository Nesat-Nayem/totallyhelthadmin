import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantsMenuCategory from './components/RestaurantsMenuCategory'

export const metadata: Metadata = { title: ' Menu Category' }

const RestaurantsMenuCategoryPage = () => {
  return (
    <>
      <PageTItle title=" Menu Category" />
      <RestaurantsMenuCategory />
    </>
  )
}

export default RestaurantsMenuCategoryPage
