import React from 'react'
import Category from './components/Category'
import CategoryList from './components/CategoryList'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Category List' }

const CategoryListPage = () => {
  return (
    <>
      <PageTItle title="CATEGORIES LIST" />
      <Category />
      <CategoryList />
    </>
  )
}

export default CategoryListPage
