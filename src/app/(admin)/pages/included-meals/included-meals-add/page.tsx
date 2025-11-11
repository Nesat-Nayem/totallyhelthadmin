import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import IncludedMealsAdd from './components/IncludedMealsAdd'

export const metadata: Metadata = { title: 'Add Included Meal' }

const IncludedMealsAddPage = () => {
  return (
    <>
      <PageTItle title="Add Included Meal" />
      <IncludedMealsAdd />
    </>
  )
}

export default IncludedMealsAddPage

