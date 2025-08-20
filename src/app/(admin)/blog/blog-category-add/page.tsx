import React from 'react'
import { Col, Row } from 'react-bootstrap'
import FileUpload from '@/components/FileUpload'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AddCategory from './components/AddCategory'

export const metadata: Metadata = { title: 'Category Add' }

const CategoryAddPage = () => {
  return (
    <>
      <PageTItle title="CREATE CATEGORY" />
      <Row>
        <AddCategory />
      </Row>
    </>
  )
}

export default CategoryAddPage
