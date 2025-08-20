import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EditMealPlan from './components/EditMealPlan'

export const metadata: Metadata = { title: 'Edit Meal Plan' }

const EditMealPlanPage = () => {
  return (
    <>
      <PageTItle title="Edit Meal Plan" />
      <EditMealPlan />
    </>
  )
}

export default EditMealPlanPage
