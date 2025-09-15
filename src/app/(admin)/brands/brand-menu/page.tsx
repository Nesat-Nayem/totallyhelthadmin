import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import BrandsMenu from './components/BrandsMenu'

export const metadata: Metadata = { title: 'Brands Menu' }

const BrandsMenuPage = () => {
  return (
    <>
      <PageTItle title="Brands Menu" />
      <BrandsMenu />
    </>
  )
}

export default BrandsMenuPage
