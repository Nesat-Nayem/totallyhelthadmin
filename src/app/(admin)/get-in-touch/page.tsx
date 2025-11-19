import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import GetInTouchForm from './components/GetInTouchForm'

export const metadata: Metadata = { title: 'Get In Touch' }

const GetInTouchPage = () => {
  return (
    <>
      <PageTItle title="Get In Touch" />
      <GetInTouchForm />
    </>
  )
}

export default GetInTouchPage

