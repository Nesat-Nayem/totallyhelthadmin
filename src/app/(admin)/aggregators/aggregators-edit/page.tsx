import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AggregatorsEdit from './components/AggregatorsEdit'

export const metadata: Metadata = { title: 'Aggregators  Edit' }

const AggregatorsEditPage = () => {
  return (
    <>
      <PageTItle title="Aggregators Edit" />
      <AggregatorsEdit />
    </>
  )
}

export default AggregatorsEditPage
