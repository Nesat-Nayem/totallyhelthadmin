import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import HomeBannerEdit from '../components/HomeBannerEdit'

export const metadata: Metadata = { title: 'Home Banner Edit' }

interface HomeBannerEditPageProps {
  params: {
    id: string
  }
}

const HomeBannerEditPage = ({ params }: HomeBannerEditPageProps) => {
  return (
    <>
      <PageTItle title="Home Banner Edit" />
      <HomeBannerEdit id={params.id} />
    </>
  )
}

export default HomeBannerEditPage

