import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MembershipMenu from './components/MembershipMenu'

export const metadata: Metadata = { title: 'Membership Menu  List' }

const MembershipMenuPage = () => {
  return (
    <>
      <PageTItle title="Membership Menu List" />
      <MembershipMenu />
    </>
  )
}

export default MembershipMenuPage
