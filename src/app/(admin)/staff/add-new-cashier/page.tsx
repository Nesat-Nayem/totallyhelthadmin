import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CasherAdd from './components/CasherAdd'

export const metadata: Metadata = { title: 'Casher Add' }

const CasherAddPage = () => {
  return (
    <>
      <PageTItle title="Casher ADD" />
      <CasherAdd />
    </>
  )
}

export default CasherAddPage
