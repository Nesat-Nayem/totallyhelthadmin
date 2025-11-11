import React, { Suspense } from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ExpenseAdd from './components/ExpenseAdd'

export const metadata: Metadata = { title: 'Expense Add' }

const ExpenseAddPage = () => {
  return (
    <>
      <PageTItle title="Expense ADD" />
      <Suspense fallback={<div>Loading...</div>}>
        <ExpenseAdd />
      </Suspense>
    </>
  )
}

export default ExpenseAddPage
