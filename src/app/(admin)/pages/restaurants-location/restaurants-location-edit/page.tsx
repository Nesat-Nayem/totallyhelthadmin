import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantsLocationEdit from './components/RestaurantsLocationEdit'

export const metadata: Metadata = { title: 'Restaurants Location Edit' }

const RestaurantsLocationEditPage = () => {
  return (
    <>
      <PageTItle title="Restaurants Location Edit" />
      <RestaurantsLocationEdit />
    </>
  )
}

export default RestaurantsLocationEditPage
