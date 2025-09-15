import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import BranchEdit from './components/BranchEdit'

export const metadata: Metadata = { title: 'Branch  Edit' }

const BranchEditPage = () => {
  return (
    <>
      <PageTItle title="Branch Edit" />
      <BranchEdit />
    </>
  )
}

export default BranchEditPage
