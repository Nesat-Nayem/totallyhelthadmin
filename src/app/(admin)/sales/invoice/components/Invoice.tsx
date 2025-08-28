'use client'

import React, { useMemo, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button, Card, Col, ListGroup, Row } from 'react-bootstrap'
import LogoBox from '@/components/LogoBox'
import barcode from '@/assets/images/barcode.webp'

// Keep in sync with POS/PrintOrder types
export type InvoiceOrder = {
  invoiceNo: string
  date: string
  customer?: { id?: string; name: string }
  items: { id?: string; title: string; price: number; qty: number }[]
  subTotal: number
  total: number
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

type Props = { order?: InvoiceOrder }

const Invoice: React.FC<Props> = ({ order }) => {
  const printRef = useRef<HTMLDivElement>(null)

  const displayDate = useMemo(() => {
    if (!order?.date) return ''
    try {
      return new Date(order.date).toLocaleString()
    } catch {
      return order.date
    }
  }, [order?.date])

  const handlePrint = useCallback(() => window.print(), [])

  const handleDownloadPdf = useCallback(async () => {
    if (!printRef.current) return
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])
    const canvas = await html2canvas(printRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
    const imgWidth = canvas.width * ratio
    const imgHeight = canvas.height * ratio
    const x = (pageWidth - imgWidth) / 2
    const y = 20
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
    pdf.save(`invoice-${order?.invoiceNo || 'order'}.pdf`)
  }, [order?.invoiceNo])

  return (
    <>
      <Row>
        <Col lg={12}>
          <Card className="p-3">
            <div ref={printRef}>
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
                    <tr key={(it.id || it.title) + idx}>
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
                  <strong>Discount:</strong> <span>AED {order?.discountAmount ?? 0}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                  <strong>Shipping Charge:</strong> <span>AED {order?.shippingCharge ?? 0}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                  <strong>Total Bill:</strong> <span>AED {order?.total ?? 0}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-1">
                  <strong>Rounding :</strong> <span>AED {order?.rounding ?? 0}</span>
                </ListGroup.Item>
              </ListGroup>

              <hr className="my-2" />

              <h6 className="text-end text-primary">
                Total Payable: <strong>AED {order?.payableAmount ?? order?.total ?? 0}</strong>
              </h6>

              <ListGroup variant="flush" className="small text-end mt-2">
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

              <p className="text-center mt-3 small text-muted">
                **VAT against this challan is payable through central registration. Thank you for your business!
              </p>

              <div className="text-center my-3">
                <Image src={barcode} alt="barcode" width={150} height={40} />
                <div className="fw-bold mt-2">Sale {order?.invoiceNo || '-'}</div>
                <div className="small">Thank You For Shopping With Us. Please Come Again</div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Button variant="dark" onClick={handlePrint}>
                Print / Save as PDF
              </Button>
              <Button variant="outline-secondary" onClick={handleDownloadPdf}>
                Download PDF
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Invoice
