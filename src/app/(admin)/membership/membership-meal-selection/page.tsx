import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MembershipMealSelection from './components/MembershipMealSelection'
import TopBarNav from '@/components/layout/TopNavigationBar/components/TopbarNav'

export const metadata: Metadata = { title: 'Membership Meal Selection' }

const MembershipMealSelectionPage = () => {
  return (
    <>
   
      <PageTItle title="Membership Meal Selection" />
      <MembershipMealSelection />
    </>
  )
}

export default MembershipMealSelectionPage

