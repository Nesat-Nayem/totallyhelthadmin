import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import TestimonialEdit from './components/TestimonialEdit'

export const metadata: Metadata = { title: 'Testimonial Edit' }

const TestimonialEditPage = () => {
  return (
    <>
      <PageTItle title="Testimonial Edit" />
      <TestimonialEdit />
    </>
  )
}

export default TestimonialEditPage
