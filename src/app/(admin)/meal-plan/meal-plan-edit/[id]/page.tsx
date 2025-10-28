import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EditMealPlan from '../components/EditMealPlan'

export const metadata: Metadata = { title: 'Edit Meal Plan' }

interface EditMealPlanPageProps {
  params: {
    id: string
  }
}

const EditMealPlanPage = ({ params }: EditMealPlanPageProps) => {
  return (
    <>
      <PageTItle title="Edit Meal Plan" />
      <EditMealPlan id={params.id} />
    </>
  )
}

export default EditMealPlanPage
