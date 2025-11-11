import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ApprovedByForm from '../../components/ApprovedByForm'

export const metadata: Metadata = { title: 'Edit Approved By' }

const EditApprovedByPage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTItle title="Edit Approved By" />
      <ApprovedByForm id={params.id} />
    </>
  )
}

export default EditApprovedByPage

