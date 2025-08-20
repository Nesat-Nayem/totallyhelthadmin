import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import TestimonialAdd from './components/TestimonialAdd'

export const metadata: Metadata = { title: 'Testimonial Add' }

const TestimonialAddPage = () => {
  return (
    <>
      <PageTItle title="Testimonial Add" />
      <TestimonialAdd />
    </>
  )
}

export default TestimonialAddPage
