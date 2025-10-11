import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MenuPlanView from '../components/MenuPlanView'

export const metadata: Metadata = { title: 'Meal Plan View' }

interface MenuPlanViewPageProps {
  params: {
    id: string
  }
}

const MenuPlanViewPage = ({ params }: MenuPlanViewPageProps) => {
  return (
    <>
      <PageTItle title="Meal Plan View" />
      <MenuPlanView id={params.id} />
    </>
  )
}

export default MenuPlanViewPage
