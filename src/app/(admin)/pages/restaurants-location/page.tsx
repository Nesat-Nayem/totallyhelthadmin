import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantsLocation from './components/RestaurantsLocation'

export const metadata: Metadata = { title: 'Restaurants Location' }

const RestaurantsLocationPage = () => {
  return (
    <>
      <PageTItle title="Restaurants Location" />
      <RestaurantsLocation />
    </>
  )
}

export default RestaurantsLocationPage
