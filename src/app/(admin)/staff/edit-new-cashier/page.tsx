import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CasherEdit from './components/CasherEdit'

export const metadata: Metadata = { title: 'Casher Edit' }

const CasherEditPage = () => {
  return (
    <>
      <PageTItle title="Casher Edit" />
      <CasherEdit />
    </>
  )
}

export default CasherEditPage
