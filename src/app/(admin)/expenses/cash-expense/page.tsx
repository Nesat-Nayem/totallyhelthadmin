import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CashExpenseList from './components/CashExpenseList'

export const metadata: Metadata = { title: 'Cash Expense List' }

const CashExpenseListPage = () => {
  return (
    <>
      <PageTItle title="Cash Expense LIST" />
      <CashExpenseList />
    </>
  )
}

export default CashExpenseListPage
