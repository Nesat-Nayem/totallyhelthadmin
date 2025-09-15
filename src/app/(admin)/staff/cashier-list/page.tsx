import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CasherList from './components/CasherList'

export const metadata: Metadata = { title: 'Casher List' }

const CasherListPage = () => {
  return (
    <>
      <PageTItle title="Casher List" />
      <CasherList />
    </>
  )
}

export default CasherListPage
