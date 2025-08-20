import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import InventoryList from './components/InventoryList'

export const metadata: Metadata = { title: 'Inventory List' }

const InventoryListPage = () => {
  return (
    <>
      <PageTItle title="Inventory LIST" />
      <InventoryList />
    </>
  )
}

export default InventoryListPage
