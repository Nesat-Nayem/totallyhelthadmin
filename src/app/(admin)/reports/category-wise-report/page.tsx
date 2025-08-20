import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CategoryListReport from './components/CategoryListReport'

export const metadata: Metadata = { title: 'category Wise Report' }

const categoryListPage = () => {
  return (
    <>
      <PageTItle title="category Wise Report " />
      <CategoryListReport />
    </>
  )
}

export default categoryListPage
