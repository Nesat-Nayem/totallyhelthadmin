import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AggregatorsMemuLinking from './components/AggregatorsMemuLinking'

export const metadata: Metadata = { title: 'Aggregators Menu Linking' }

const AggregatorsMemuLinkingPage = () => {
  return (
    <>
      <PageTItle title="Aggregators Menu Linking" />
      <AggregatorsMemuLinking />
    </>
  )
}

export default AggregatorsMemuLinkingPage
