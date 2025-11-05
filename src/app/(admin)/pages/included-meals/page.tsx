import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import IncludedMeals from './components/IncludedMeals'

export const metadata: Metadata = { title: 'Included Meals' }

const IncludedMealsPage = () => {
  return (
    <>
      <PageTItle title="Included Meals" />
      <IncludedMeals />
    </>
  )
}

export default IncludedMealsPage

