import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import HomeBannerEdit from './components/HomeBannerEdit'

export const metadata: Metadata = { title: 'Home Banner Edit' }

const HomeBannerEditPage = () => {
  return (
    <>
      <PageTItle title="Home Banner Edit" />
      <HomeBannerEdit />
    </>
  )
}

export default HomeBannerEditPage
