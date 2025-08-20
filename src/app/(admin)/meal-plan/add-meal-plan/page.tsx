import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AddMealPlan from './components/AddMealPlan'

export const metadata: Metadata = { title: 'Add Meal Plan' }

const AddMealPlanPage = () => {
  return (
    <>
      <PageTItle title="Add Meal Plan" />
      <AddMealPlan />
    </>
  )
}

export default AddMealPlanPage
