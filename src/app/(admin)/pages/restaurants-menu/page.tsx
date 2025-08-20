import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantsMenu from './components/RestaurantsMenu'

export const metadata: Metadata = { title: 'Restaurants Menu' }

const RestaurantsMenuPage = () => {
  return (
    <>
      <PageTItle title="Restaurants Menu" />
      <RestaurantsMenu />
    </>
  )
}

export default RestaurantsMenuPage
