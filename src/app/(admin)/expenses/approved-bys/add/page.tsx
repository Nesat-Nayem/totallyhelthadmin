import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ApprovedByForm from '../components/ApprovedByForm'

export const metadata: Metadata = { title: 'Add Approved By' }

const AddApprovedByPage = () => {
  return (
    <>
      <PageTItle title="Add Approved By" />
      <ApprovedByForm />
    </>
  )
}

export default AddApprovedByPage

