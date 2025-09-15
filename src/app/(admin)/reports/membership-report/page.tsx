import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MembershipList from './components/MembershipList'

export const metadata: Metadata = { title: 'Membership Report' }

const MembershipListPage = () => {
  return (
    <>
      <PageTItle title="Membership Report " />
      <MembershipList />
    </>
  )
}

export default MembershipListPage
