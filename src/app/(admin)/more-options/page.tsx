import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MoreOptions from './components/MoreOptions'

export const metadata: Metadata = { title: 'More Options List' }

const MoreOptionsPage = () => {
  return (
    <>
      <PageTItle title="More Options List" />
      <MoreOptions />
    </>
  )
}

export default MoreOptionsPage
