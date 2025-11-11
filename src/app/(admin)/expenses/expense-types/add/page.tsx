import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ExpenseTypeForm from '../components/ExpenseTypeForm'

export const metadata: Metadata = { title: 'Add Expense Type' }

const AddExpenseTypePage = () => {
  return (
    <>
      <PageTItle title="Add Expense Type" />
      <ExpenseTypeForm />
    </>
  )
}

export default AddExpenseTypePage

