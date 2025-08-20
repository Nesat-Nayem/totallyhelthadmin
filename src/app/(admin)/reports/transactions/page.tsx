import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import TransactionList from './components/TransactionList'

export const metadata: Metadata = { title: 'All transactions List' }

const TransactionListPage = () => {
  return (
    <>
      <PageTItle title="transactions List" />
      <TransactionList />
    </>
  )
}

export default TransactionListPage
