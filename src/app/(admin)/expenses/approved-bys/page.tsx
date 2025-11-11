import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ApprovedByList from './components/ApprovedByList'

export const metadata: Metadata = { title: 'Approved By' }

const ApprovedByPage = () => {
  return (
    <>
      <PageTItle title="Approved By" />
      <ApprovedByList />
    </>
  )
}

export default ApprovedByPage

