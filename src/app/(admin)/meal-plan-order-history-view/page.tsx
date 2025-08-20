import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MenuPlanOrderview from './components/MenuPlanOrderview'

export const metadata: Metadata = { title: 'Meal Plan Order View' }

const MenuPlanOrderViewPage = () => {
  return (
    <>
      <PageTItle title="Meal Plan Order View" />
      <MenuPlanOrderview />
    </>
  )
}

export default MenuPlanOrderViewPage
