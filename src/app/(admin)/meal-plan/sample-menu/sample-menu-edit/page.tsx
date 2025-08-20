import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SampleMenuAdd from './components/SampleMenuEdit'
import SampleMenuEdit from './components/SampleMenuEdit'

export const metadata: Metadata = { title: 'Sample Menu Edit' }

const SampleMenuEditPage = () => {
  return (
    <>
      <PageTItle title="Sample Menu Edit" />
      <SampleMenuEdit />
    </>
  )
}

export default SampleMenuEditPage
