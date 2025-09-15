'use client'

import TextFormInput from '@/components/form/TextFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getAllOrders } from '@/helpers/data'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormControl,
  InputGroup,
  Row,
} from 'react-bootstrap'
import { Form } from 'react-hook-form'
import ReportModal from './ReportModal'

const DayCloseReport = () => {
  const [currentDate, setCurrentDate] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setCurrentDate(today)
  }, [])

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                Day Close Report
              </CardTitle>

              <div>
                <input
                  type="date"
                  name="stock"
                  id="dateInput"
                  className="form-control"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                />
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
              <div className="table-responsive">
                <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th style={{ width: 20 }}>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="customCheck1" />
                          <label className="form-check-label" htmlFor="customCheck1" />
                        </div>
                      </th>
                      <th style={{ textWrap: 'nowrap' }}>Staff ID</th>
                      <th style={{ textWrap: 'nowrap' }}>Staff Designation</th>
                      <th style={{ textWrap: 'nowrap' }}>Log In Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Log In Time</th>
                      <th style={{ textWrap: 'nowrap' }}>Log Out Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Log Out Time</th>
                      <th style={{ textWrap: 'nowrap' }}>Close Status</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="customCheck2" />
                          <label className="form-check-label" htmlFor="customCheck2">
                            &nbsp;
                          </label>
                        </div>
                      </td>

                      <td style={{ textWrap: 'nowrap' }}>#001</td>
                      <td style={{ textWrap: 'nowrap' }}>Cashier</td>
                      <td style={{ textWrap: 'nowrap' }}>10 Sept 2025</td>
                      <td style={{ textWrap: 'nowrap' }}>10:00 AM</td>
                      <td style={{ textWrap: 'nowrap' }}>10 Sept 2025</td>
                      <td style={{ textWrap: 'nowrap' }}>07:00 PM</td>
                      <td style={{ textWrap: 'nowrap' }}>
                        <span className="badge bg-soft-success text-success">Closed</span>
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-soft-danger btn-sm" onClick={() => setIsOpen(true)}>
                            <IconifyIcon icon="solar:bill-list-bold-duotone" className="align-middle fs-18" />
                          </button>

                          <Link href="" className="btn btn-soft-danger btn-sm">
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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

      <ReportModal show={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

export default DayCloseReport
