import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import InventoryAdd from './components/InventoryAdd'

export const metadata: Metadata = { title: 'Inventory Add' }

const InventoryAddPage = () => {
  return (
    <>
      <PageTItle title="Inventory Add" />
      <Row>
        <Col xl={12} lg={12}>
          <InventoryAdd />
        </Col>
      </Row>
    </>
  )
}

export default InventoryAddPage
