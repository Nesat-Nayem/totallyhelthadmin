import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import WhyChooseUs from './components/WhyChooseUs'

export const metadata: Metadata = { title: 'Why Choose us' }

const WhyChooseUsPage = () => {
  return (
    <>
      <PageTItle title="Why Choose us" />
      <WhyChooseUs />
    </>
  )
}

export default WhyChooseUsPage
