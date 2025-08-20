import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ContactEnquiryList from './components/ContactEnquiryList'

export const metadata: Metadata = { title: 'Contact Enquiry List' }

const ContactPage = () => {
  return (
    <>
      <PageTItle title="Contact Enquiry List" />
      <ContactEnquiryList />
    </>
  )
}

export default ContactPage
