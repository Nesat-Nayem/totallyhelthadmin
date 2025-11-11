import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ExpenseTypeList from './components/ExpenseTypeList'

export const metadata: Metadata = { title: 'Expense Types' }

const ExpenseTypePage = () => {
  return (
    <>
      <PageTItle title="Expense Types" />
      <ExpenseTypeList />
    </>
  )
}

export default ExpenseTypePage

