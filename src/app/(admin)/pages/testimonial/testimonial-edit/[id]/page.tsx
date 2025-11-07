import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import TestimonialEdit from '../components/TestimonialEdit'

export const metadata: Metadata = { title: 'Testimonial Edit' }

interface TestimonialEditPageProps {
  params: {
    id: string
  }
}

const TestimonialEditPage = ({ params }: TestimonialEditPageProps) => {
  return (
    <>
      <PageTItle title="Testimonial Edit" />
      <TestimonialEdit id={params.id} />
    </>
  )
}

export default TestimonialEditPage

