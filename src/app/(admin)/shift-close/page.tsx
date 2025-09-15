import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ShiftClose from './components/ShiftClose'

export const metadata: Metadata = { title: 'Shift Close' }

const ShiftClosePage = () => {
  return (
    <>
      <PageTItle title="Shift Close" />
      <ShiftClose />
    </>
  )
}

export default ShiftClosePage
