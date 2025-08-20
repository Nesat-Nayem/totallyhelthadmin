import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import HomeBannerAdd from './components/HomeBannerAdd'

export const metadata: Metadata = { title: 'Home Banner Add' }

const HomeBannerAddPage = () => {
  return (
    <>
      <PageTItle title="Home Banner Add" />
      <HomeBannerAdd />
    </>
  )
}

export default HomeBannerAddPage
