import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'

import MenuEdit from './components/MenuEdit'

export const metadata: Metadata = { title: ' Menu   Edit' }

const MenuEditPage = () => {
  return (
    <>
      <PageTItle title=" Menu Edit" />
      <MenuEdit />
    </>
  )
}

export default MenuEditPage
