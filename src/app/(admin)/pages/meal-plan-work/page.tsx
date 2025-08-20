import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MealPlanWork from './components/MealPlanWork'

export const metadata: Metadata = { title: 'Meal Plan Work' }

const MealPlanWorkPage = () => {
  return (
    <>
      <PageTItle title="Meal Plan Work" />
      <MealPlanWork />
    </>
  )
}

export default MealPlanWorkPage
