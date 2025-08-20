'use client'

import LogoBox from '@/components/LogoBox'
import Image from 'next/image'
import React from 'react'
import { Button, Card, CardFooter, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, ListGroup, Row } from 'react-bootstrap'
import barcode from '@/assets/images/barcode.webp'
const InvoiceView = () => {
  return (
    <>
      <Row>
        <Col lg={12}>
          <Card className="p-3">
            <div className="text-center mb-3">
              <LogoBox />
              <h6 className="mt-2 mb-0">Totally Health Pvt Ltd.,</h6>
              <small>Phone Number: +97 5656666566</small>
              <br />
              <small>Email: info@totallyhealth.com</small>
            </div>

            <hr />

            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <div>
                  <strong>Name:</strong> Suraj Jamdade
                </div>
                <div>
                  <strong>Customer Id:</strong> #0001
                </div>
              </div>
              <div className="d-flex justify-content-between">
                <div>
                  <strong>Invoice No:</strong> S001
                </div>
                <div>
                  <strong>Date:</strong> 02 Aug 2025
                </div>
              </div>
            </div>

            <table className="table table-bordered text-center small">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>International Meal Plan</td>
                  <td>AED 100</td>
                  <td>3</td>
                  <td>AED 320</td>
                </tr>
              </tbody>
            </table>

            <ListGroup variant="flush" className="small text-end">
              <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                <strong>Receive Amount:</strong> <span>AED 320.00</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                <strong>Change Amount:</strong> <span>AED 0.00</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                <strong>Sub Total:</strong> <span className="text-danger">AED 320.00</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                <strong>GST (18%):</strong> <span>AED 320.00</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                <strong>Discount:</strong> <span> AED 0.00</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                <strong>Shipping Charge:</strong> <span> AED 0.00</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                <strong>Total Bill:</strong> <span>AED 655.00</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                <strong>Rounding :</strong> <span>AED 0.00</span>
              </ListGroup.Item>
            </ListGroup>

            <hr className="my-2" />

            <h6 className="text-end text-primary">
              Total Payable: <strong>AED 655.00</strong>
            </h6>

            <p className="text-center mt-3 small text-muted">
              **VAT against this challan is payable through central registration. Thank you for your business!
            </p>

            <div className="text-center my-3">
              <Image src={barcode} alt="barcode" width={150} height={40} />
              <div className="fw-bold mt-2">Sale S001</div>
              <div className="small">Thank You For Shopping With Us. Please Come Again</div>
            </div>
          </Card>
        </Col>
        <Button variant="dark" onClick={() => window.print()}>
          Print Receipt
        </Button>
      </Row>
    </>
  )
}

export default InvoiceView
