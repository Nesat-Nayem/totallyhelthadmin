import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantsMenuCategoryAdd from './components/RestaurantsMenuCategoryAdd'

export const metadata: Metadata = { title: 'Restaurants Menu Category  Add' }

const RestaurantsMenuCategoryAddPage = () => {
  return (
    <>
      <PageTItle title="Restaurants Menu Category Add" />
      <RestaurantsMenuCategoryAdd />
    </>
  )
}

export default RestaurantsMenuCategoryAddPage
