import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import DayCloseReport from './components/DayCloseReport'

export const metadata: Metadata = { title: 'Day Close Report ' }

const DayCloseReportPage = () => {
  return (
    <>
      <PageTItle title="Day Close Report " />
      <DayCloseReport />
    </>
  )
}

export default DayCloseReportPage
