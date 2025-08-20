import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantsMenuAdd from './components/RestaurantsMenuAdd'

export const metadata: Metadata = { title: 'Restaurants Menu   Add' }

const RestaurantsMenuAddPage = () => {
  return (
    <>
      <PageTItle title="Restaurants Menu  Add" />
      <RestaurantsMenuAdd />
    </>
  )
}

export default RestaurantsMenuAddPage
