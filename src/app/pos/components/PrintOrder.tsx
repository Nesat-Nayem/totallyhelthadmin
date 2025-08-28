'use client'

import React, { useMemo, useState } from 'react'
import { Modal, Button, ListGroup } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import LogoBox from '@/components/LogoBox'
import barcode from '@/assets/images/barcode.webp'

type OrderItem = { id: string; title: string; price: number; qty: number }
type Order = {
  id: string
  invoiceNo: string
  date: string
  customer?: { id?: string; name: string }
  items: OrderItem[]
  subTotal: number
  total: number
  // extended
  vatPercent?: number
  vatAmount?: number
  discountType?: 'flat' | 'percent'
  discountAmount?: number
  shippingCharge?: number
  rounding?: number
  payableAmount?: number
  receiveAmount?: number
  changeAmount?: number
  dueAmount?: number
  paymentMode?: string
}

const PrintOrder = ({ order }: { order?: Order }) => {
  const [showModal, setShowModal] = useState(false)

  const handleShow = () => setShowModal(true)
  const handleClose = () => setShowModal(false)

  const hasItems = !!order && order.items && order.items.length > 0
  const displayDate = useMemo(() => {
    if (!order?.date) return ''
    try {
      return new Date(order.date).toLocaleString()
    } catch {
      return order.date
    }
  }, [order?.date])

  return (
    <>
      <Button variant="info" size="sm" onClick={handleShow} disabled={!hasItems} title={!hasItems ? 'No items to print' : 'Print Order'}>
        <IconifyIcon icon="mdi:printer" className="me-1" />
        Print Order
      </Button>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tax Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
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
                <strong>Name:</strong> {order?.customer?.name || 'Guest'}
              </div>
              <div>
                <strong>Customer Id:</strong> {order?.customer?.id || '-'}
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <div>
                <strong>Invoice No:</strong> {order?.invoiceNo || '-'}
              </div>
              <div>
                <strong>Date:</strong> {displayDate}
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
              {order?.items?.map((it, idx) => (
                <tr key={it.id}>
                  <td>{idx + 1}</td>
                  <td>{it.title}</td>
                  <td>AED {it.price}</td>
                  <td>{it.qty}</td>
                  <td>AED {it.price * it.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <ListGroup variant="flush" className="small text-end">
            <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
              <strong>Sub Total:</strong> <span className="text-danger">AED {order?.subTotal ?? 0}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
              <strong>VAT ({order?.vatPercent ?? 0}%):</strong> <span>AED {order?.vatAmount ?? 0}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
              <strong>Discount ({order?.discountType === 'percent' ? '%' : 'AED'}):</strong> <span>AED {order?.discountAmount ?? 0}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
              <strong>Shipping Charge:</strong> <span>AED {order?.shippingCharge ?? 0}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
              <strong>Total Bill:</strong> <span>AED {order?.total ?? 0}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
              <strong>Rounding(+/-):</strong> <span>AED {order?.rounding ?? 0}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
              <strong>Payable Amount:</strong> <span>AED {order?.payableAmount ?? order?.total ?? 0}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
              <strong>Receive Amount:</strong> <span>AED {order?.receiveAmount ?? 0}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
              <strong>Change Amount:</strong> <span>AED {order?.changeAmount ?? 0}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
              <strong>Due Amount:</strong> <span>AED {order?.dueAmount ?? 0}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
              <strong>Paid by:</strong> <span>{order?.paymentMode || 'Cash'}</span>
            </ListGroup.Item>
          </ListGroup>

          <hr className="my-2" />

          <h6 className="text-end text-primary">
            Total Payable: <strong>AED {order?.payableAmount ?? order?.total ?? 0}</strong>
          </h6>

          <p className="text-center mt-3 small text-muted">
            **VAT against this challan is payable through central registration. Thank you for your business!
          </p>

          <div className="text-center my-3">
            <Image src={barcode} alt="barcode" width={150} height={40} />
            <div className="fw-bold mt-2">Sale {order?.invoiceNo}</div>
            <div className="small">Thank You For Shopping With Us. Please Come Again</div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="dark" onClick={() => window.print()} disabled={!hasItems}>
            Print Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default PrintOrder
