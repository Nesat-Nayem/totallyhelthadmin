'use client'

import React, { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import Image from 'next/image'
import LogoBox from '@/components/LogoBox'

const PrintOrder = () => {
  const [showModal, setShowModal] = useState(false)

  const handleShow = () => setShowModal(true)
  const handleClose = () => setShowModal(false)

  return (
    <>
      {/* Trigger Button */}
      <Button variant="info" size="sm" onClick={handleShow}>
        🖨 Print Order
      </Button>

      {/* Invoice Modal */}
      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Body className="px-4 py-3">
          {/* Header */}
          <div className="text-center mb-2">
            <LogoBox />
            <h5 className="fw-bold mt-2 mb-0">TOTALLY HEALTHY</h5>
            <small className="d-block">Company Name: AL AKL AL SAHI</small>
            <small className="d-block">Tel: 065392229 / 509632223</small>
            <small className="d-block fw-bold">TRN : 100512693100003</small>
          </div>

          <hr />

          {/* Bill Info */}
          <div className="small mb-2">
            <div>BillNo: P-439162</div>
            <div>Date: 28/08/2025 01:46</div>
            <div>Membership: –</div>
            <div>User: CASH</div>
          </div>

          <hr />

          {/* Items */}
          <div className="small mb-2">
            <div className="d-flex justify-content-between">
              <span>BIG SMART PLATTER CHIC</span>
              <span>40.00</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Chef Salad - QUINOA SALAD</span>
              <span>34.29</span>
            </div>
          </div>

          <hr />

          {/* Bill Summary */}
          <div className="small">
            <div className="d-flex justify-content-between">
              <strong>BILL AMOUNT</strong>
              <span>74.29</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong>5 % VAT AMOUNT</strong>
              <span>3.71</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong>GRAND TOTAL</strong>
              <span>78.00</span>
            </div>
          </div>

          <hr />

          {/* Customer Info */}
          <div className="small mb-2">
            <div>
              <strong>CUST. NAME :</strong> MS WASLA
            </div>
            <div>Address1: AL TARFA STR11 VILLA 124</div>
            <div>Mobile No: 0504222235</div>
          </div>

          {/* Footer */}
          <p className="text-center small mt-3 mb-0">Thank You & Come Again</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="dark" onClick={() => window.print()}>
            Print Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default PrintOrder
