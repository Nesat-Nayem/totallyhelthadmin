import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SampleMenuAdd from './components/SampleMenuAdd'

export const metadata: Metadata = { title: 'Sample Menu Add' }

const SampleMenuAddPage = () => {
  return (
    <>
      <PageTItle title="Sample Menu Add" />
      <SampleMenuAdd />
    </>
  )
}

export default SampleMenuAddPage
