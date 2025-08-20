import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AboutUS from './components/AboutUS'

export const metadata: Metadata = { title: 'About-us' }

const AboutPage = () => {
  return (
    <>
      <PageTItle title="About-us" />
      <AboutUS />
    </>
  )
}

export default AboutPage
