import React from 'react'
import { Col, Row } from 'react-bootstrap'
import FileUpload from '@/components/FileUpload'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EditCategory from './components/EditCategory'

export const metadata: Metadata = { title: 'Category Edit' }

const CategoryEditPage = () => {
  return (
    <>
      <PageTItle title="EDIT CATEGORY" />
      <Row>
        <EditCategory />
      </Row>
    </>
  )
}

export default CategoryEditPage
