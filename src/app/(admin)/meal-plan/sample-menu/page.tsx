import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SamplaeMenu from './components/SamplaeMenu'

export const metadata: Metadata = { title: 'Sample Menu' }

const SamplaeMenuPage = () => {
  return (
    <>
      <PageTItle title="Sample Menu" />
      <SamplaeMenu />
    </>
  )
}

export default SamplaeMenuPage
