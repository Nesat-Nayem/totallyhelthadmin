import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Compare from './components/Compare'

export const metadata: Metadata = { title: 'Compare' }

const ComparePage = () => {
  return (
    <>
      <PageTItle title="Compare" />
      <Compare />
    </>
  )
}

export default ComparePage
