import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantsMenuEdit from './components/RestaurantsMenuEdit'

export const metadata: Metadata = { title: 'Restaurants Menu  Edit' }

const RestaurantsMenuEditPage = () => {
  return (
    <>
      <PageTItle title="Restaurants Menu Edit" />
      <RestaurantsMenuEdit />
    </>
  )
}

export default RestaurantsMenuEditPage
