import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Video from './components/Video'

export const metadata: Metadata = { title: 'Video Area' }

const videoPage = () => {
  return (
    <>
      <PageTItle title="Video Area" />
      <Video />
    </>
  )
}

export default videoPage
