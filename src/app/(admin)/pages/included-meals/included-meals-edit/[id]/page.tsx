import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import IncludedMealsEdit from '../components/IncludedMealsEdit'

export const metadata: Metadata = { title: 'Edit Included Meal' }

interface IncludedMealsEditPageProps {
  params: {
    id: string
  }
}

const IncludedMealsEditPage = ({ params }: IncludedMealsEditPageProps) => {
  return (
    <>
      <PageTItle title="Edit Included Meal" />
      <IncludedMealsEdit id={params.id} />
    </>
  )
}

export default IncludedMealsEditPage

