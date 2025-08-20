import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import BrandsAdd from './components/BrandsAdd'

export const metadata: Metadata = { title: 'Brands Add' }

const BrandsAddPage = () => {
  return (
    <>
      <PageTItle title="Brands Add" />
      <BrandsAdd />
    </>
  )
}

export default BrandsAddPage
