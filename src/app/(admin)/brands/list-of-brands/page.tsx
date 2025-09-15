import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Brands from './components/Brands'

export const metadata: Metadata = { title: 'Brands' }

const BrandsPage = () => {
  return (
    <>
      <PageTItle title="Brands" />
      <Brands />
    </>
  )
}

export default BrandsPage
