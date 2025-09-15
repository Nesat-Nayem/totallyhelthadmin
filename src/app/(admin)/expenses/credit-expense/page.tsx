import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CreditExpenseList from './components/CreditExpenseList'

export const metadata: Metadata = { title: 'Credit Expense List' }

const CreditExpenseListPage = () => {
  return (
    <>
      <PageTItle title="Credit Expense LIST" />
      <CreditExpenseList />
    </>
  )
}

export default CreditExpenseListPage
