import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import BranchAdd from './components/BranchAdd'

export const metadata: Metadata = { title: 'Branch  Add' }

const BranchAddPage = () => {
  return (
    <>
      <PageTItle title="Branch Add" />
      <BranchAdd />
    </>
  )
}

export default BranchAddPage
