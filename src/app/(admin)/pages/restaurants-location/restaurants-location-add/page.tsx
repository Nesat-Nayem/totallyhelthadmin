import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurantsLocationAdd from './components/RestaurantsLocationAdd'

export const metadata: Metadata = { title: 'Restaurants Location   Add' }

const RestaurantsLocationAddPage = () => {
  return (
    <>
      <PageTItle title="Restaurants Location  Add" />
      <RestaurantsLocationAdd />
    </>
  )
}

export default RestaurantsLocationAddPage
