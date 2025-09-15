import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Aggregators from './components/Aggregators'

export const metadata: Metadata = { title: 'Aggregators List' }

const AggregatorsPage = () => {
  return (
    <>
      <PageTItle title="Aggregators List" />
      <Aggregators />
    </>
  )
}

export default AggregatorsPage
