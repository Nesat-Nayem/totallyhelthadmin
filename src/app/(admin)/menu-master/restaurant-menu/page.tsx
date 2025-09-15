import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import RestaurentsMenu from './components/RestaurentsMenu'

export const metadata: Metadata = { title: 'Restaurents Menu  List' }

const RestaurentsMenuPage = () => {
  return (
    <>
      <PageTItle title="Restaurents Menu List" />
      <RestaurentsMenu />
    </>
  )
}

export default RestaurentsMenuPage
