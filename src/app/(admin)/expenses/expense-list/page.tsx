import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ExpenseList from './components/ExpenseList'

export const metadata: Metadata = { title: 'Expense List' }

const ExpenseListPage = () => {
  return (
    <>
      <PageTItle title="Expense LIST" />
      <ExpenseList />
    </>
  )
}

export default ExpenseListPage
