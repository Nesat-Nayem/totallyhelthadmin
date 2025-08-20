import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import InventoryEdit from './components/InventoryEdit'

export const metadata: Metadata = { title: 'Inventory Edit' }

const InventoryEditPage = () => {
  return (
    <>
      <PageTItle title="Inventory Edit" />
      <Row>
        <Col xl={12} lg={12}>
          <InventoryEdit />
        </Col>
      </Row>
    </>
  )
}

export default InventoryEditPage
