import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RoleAdd from './components/RoleAdd'

export const metadata: Metadata = { title: ' Role   Add' }

const RoleAddPage = () => {
  return (
    <>
      <PageTItle title=" Role  Add" />
      <RoleAdd />
    </>
  )
}

export default RoleAddPage
