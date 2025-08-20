import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Testimonial from './components/Testimonial'

export const metadata: Metadata = { title: 'Testimonial' }

const TestimonialPage = () => {
  return (
    <>
      <PageTItle title="Testimonial" />
      <Testimonial />
    </>
  )
}

export default TestimonialPage
