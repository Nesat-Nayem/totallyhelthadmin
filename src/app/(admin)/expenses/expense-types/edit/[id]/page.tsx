import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ExpenseTypeForm from '../../components/ExpenseTypeForm'

export const metadata: Metadata = { title: 'Edit Expense Type' }

const EditExpenseTypePage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTItle title="Edit Expense Type" />
      <ExpenseTypeForm id={params.id} />
    </>
  )
}

export default EditExpenseTypePage

