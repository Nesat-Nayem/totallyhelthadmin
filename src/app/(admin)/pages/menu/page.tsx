import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Menu from './components/Menu'

export const metadata: Metadata = { title: 'Menu Items List' }

const MenuPage = () => {
  return (
    <>
      <PageTItle title="Menu Items List" />
      <Menu />
    </>
  )
}

export default MenuPage
