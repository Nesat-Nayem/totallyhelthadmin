import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RoleEdit from './components/RoleEdit'

export const metadata: Metadata = { title: ' Role  Edit' }

const RoleAddPage = () => {
  return (
    <>
      <PageTItle title=" Role  Edit" />
      <RoleEdit />
    </>
  )
}

export default RoleAddPage
