import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RoleManagementPage from '@/app/(admin)/role-management-v2/components/RoleManagementPage'

export const metadata: Metadata = { title: 'Role Management V2 - Advanced' }

const RoleManagementV2Page = () => {
  return (
    <>
      <PageTItle title="Role Management V2 - Advanced" />
      <RoleManagementPage />
    </>
  )
}

export default RoleManagementV2Page
