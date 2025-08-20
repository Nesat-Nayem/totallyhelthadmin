import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AllIncomeList from './components/AllIncomeList'

export const metadata: Metadata = { title: 'All Income List' }

const AllIncomeListPage = () => {
  return (
    <>
      <PageTItle title="All Income List" />
      <AllIncomeList />
    </>
  )
}

export default AllIncomeListPage
