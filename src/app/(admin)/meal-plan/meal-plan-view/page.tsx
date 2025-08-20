import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MenuPlanView from './components/MenuPlanView'

export const metadata: Metadata = { title: 'Meal Plan View' }

const MenuPlanViewPage = () => {
  return (
    <>
      <PageTItle title="Meal Plan View" />
      <MenuPlanView />
    </>
  )
}

export default MenuPlanViewPage
