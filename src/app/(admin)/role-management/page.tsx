import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RoleManagementList from './components/RoleManagementList'

export const metadata: Metadata = { title: 'Role Management List' }

const RoleManagementListPage = () => {
  return (
    <>
      <PageTItle title="Role Management List" />
      <RoleManagementList />
    </>
  )
}

export default RoleManagementListPage
