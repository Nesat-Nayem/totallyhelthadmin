import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MoreOptionsEdit from './components/MoreOptionsEdit'

export const metadata: Metadata = { title: 'More Options Edit' }

const MoreOptionsEditPage = () => {
  return (
    <>
      <PageTItle title="More Options Edit" />
      <MoreOptionsEdit />
    </>
  )
}

export default MoreOptionsEditPage
