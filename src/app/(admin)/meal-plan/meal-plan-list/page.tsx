import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MealPlan from './components/MealPlan'

export const metadata: Metadata = { title: 'Meal Plan List' }

const MealPlanPage = () => {
  return (
    <>
      <PageTItle title="Meal Plan List" />
      <MealPlan />
    </>
  )
}

export default MealPlanPage
