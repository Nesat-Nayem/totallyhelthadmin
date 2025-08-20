import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantsMenuCategoryEdit from './components/RestaurantsMenuCategoryEdit'

export const metadata: Metadata = { title: 'Restaurants Menu Category Edit' }

const RestaurantsMenuCategoryEditPage = () => {
  return (
    <>
      <PageTItle title="Restaurants Menu Category Edit" />
      <RestaurantsMenuCategoryEdit />
    </>
  )
}

export default RestaurantsMenuCategoryEditPage
