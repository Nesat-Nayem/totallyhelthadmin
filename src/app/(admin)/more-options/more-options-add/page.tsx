import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MoreOptionsAdd from './components/MoreOptionsAdd'

export const metadata: Metadata = { title: 'More Options  Add' }

const MoreOptionsAddPage = () => {
  return (
    <>
      <PageTItle title="More Options Add" />
      <MoreOptionsAdd />
    </>
  )
}

export default MoreOptionsAddPage
