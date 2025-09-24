"use client"

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  FormControl,
  InputGroup,
  Row,
} from 'react-bootstrap'
import Alert from 'react-bootstrap/Alert'

const SalesList = () => {
  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')
  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                Supplier Wise Report
              </CardTitle>

              <div className="d-flex align-items-end gap-2">
                <div>
                  <label className="form-label">From</label>
                  <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">To</label>
                  <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="" className="form-label">
                  From
                </label>
                <input type="date" name="stock" placeholder="Enter Stock" className="form-control" disabled />
              </div>
              <div className="mb-3">
                <label htmlFor="" className="form-label">
                  To
                </label>
                <input type="date" name="stock" placeholder="Enter Stock" className="form-control" disabled />
              </div>

              {/* Month Filter Dropdown */}
              <select style={{ maxWidth: '200px' }} className="form-select form-select-sm p-1">
                <option value="all">Select download</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </CardHeader>

            <div>
              <Alert variant="warning" className="m-3">
                <div className="d-flex align-items-center gap-2">
                  <IconifyIcon icon="mdi:alert" className="fs-20" />
                  <div>
                    <strong>Supplier-wise Report</strong> requires a Purchase/Supplier backend (purchases, GRN, suppliers, etc.).
                    We couldn&apos;t find a purchase module in the current project. Once available, we will:
                    <ul className="mb-0">
                      <li>Fetch purchases grouped by supplier and date range</li>
                      <li>Show totals per supplier (subtotal, VAT, grand total)</li>
                      <li>Support CSV/PDF exports</li>
                    </ul>
                    For now, please manage suppliers in <Link href="/staff/supplier-list">Supplier List</Link>.
                  </div>
                </div>
              </Alert>
            </div>
            <CardFooter className="border-top">
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li className="page-item">
                    <Link className="page-link" href="">
                      Previous
                    </Link>
                  </li>
                  <li className="page-item active">
                    <Link className="page-link" href="">
                      1
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" href="">
                      2
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" href="">
                      3
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" href="">
                      Next
                    </Link>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default SalesList
