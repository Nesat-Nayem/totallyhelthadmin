import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MenuPlanOrderList from './components/MenuPlanOrderList'

export const metadata: Metadata = { title: 'Meal Plan Order History' }

const MenuPlanOrderPage = () => {
  return (
    <>
      <PageTItle title="Meal Plan Order History" />
      <MenuPlanOrderList />
    </>
  )
}

export default MenuPlanOrderPage
