import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Branches from './components/Branches'

export const metadata: Metadata = { title: 'List  Of Branches' }

const BranchesPage = () => {
  return (
    <>
      <PageTItle title="List  Of Branches" />
      <Branches />
    </>
  )
}

export default BranchesPage
