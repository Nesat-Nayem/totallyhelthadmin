import React from 'react'
import { Col, Row } from 'react-bootstrap'
import FileUpload from '@/components/FileUpload'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Category from './components/Category'

export const metadata: Metadata = { title: 'Category List' }

const CategoryPage = () => {
  return (
    <>
      <PageTItle title=" Categort List" />
      <Row>
        <Category />
      </Row>
    </>
  )
}

export default CategoryPage
