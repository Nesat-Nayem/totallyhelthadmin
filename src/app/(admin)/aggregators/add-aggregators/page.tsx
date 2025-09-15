import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AggregatorsAdd from './components/AggregatorsAdd'

export const metadata: Metadata = { title: 'Aggregators  Add' }

const AggregatorsAddPage = () => {
  return (
    <>
      <PageTItle title="Aggregators Add" />
      <AggregatorsAdd />
    </>
  )
}

export default AggregatorsAddPage
