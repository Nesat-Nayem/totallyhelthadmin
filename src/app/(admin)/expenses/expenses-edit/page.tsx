import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ExpenseEdit from './components/ExpenseEdit'

export const metadata: Metadata = { title: 'Expense Edit' }

const ExpenseEditPage = () => {
  return (
    <>
      <PageTItle title="Expense Edit" />
      <ExpenseEdit />
    </>
  )
}

export default ExpenseEditPage
