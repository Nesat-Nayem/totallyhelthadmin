import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import DeliveryAdd from './components/ExpenseAdd'
import ExpenseAdd from './components/ExpenseAdd'

export const metadata: Metadata = { title: 'Expense Add' }

const ExpenseAddPage = () => {
  return (
    <>
      <PageTItle title="Expense ADD" />
      <ExpenseAdd />
    </>
  )
}

export default ExpenseAddPage
