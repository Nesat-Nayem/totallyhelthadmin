import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import POS from './components/POS'

export const metadata: Metadata = { title: 'POS' }

const POSPage = () => {
  return (
    <>
      <PageTItle title="POS" />
      <POS />
    </>
  )
}

export default POSPage
