import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import BrandsEdit from './components/BrandsEdit'

export const metadata: Metadata = { title: 'Brands  Edit' }

const BrandsEditPage = () => {
  return (
    <>
      <PageTItle title="Brands Edit" />
      <BrandsEdit />
    </>
  )
}

export default BrandsEditPage
