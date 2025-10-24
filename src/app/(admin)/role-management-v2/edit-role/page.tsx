import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EditRolePage from './components/EditRolePage'

export const metadata: Metadata = { title: 'Edit Role - V2' }

const EditRoleV2Page = () => {
  return (
    <>
      <PageTItle title="Edit Role - V2" />
      <EditRolePage />
    </>
  )
}

export default EditRoleV2Page
