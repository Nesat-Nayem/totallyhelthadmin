import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AddRolePage from './components/AddRolePage'

export const metadata: Metadata = { title: 'Add New Role - V2' }

const AddNewRoleV2Page = () => {
  return (
    <>
      <PageTItle title="Add New Role - V2" />
      <AddRolePage />
    </>
  )
}

export default AddNewRoleV2Page
