import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'

import MenuAdd from './components/MenuAdd'

export const metadata: Metadata = { title: ' Menu   Add' }

const MenuAddPage = () => {
  return (
    <>
      <PageTItle title=" Menu  Add" />
      <MenuAdd />
    </>
  )
}

export default MenuAddPage
