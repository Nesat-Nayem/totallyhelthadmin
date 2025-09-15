'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getAllOrders } from '@/helpers/data'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button, Card, CardFooter, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, Row } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
const CustomerMenbershipList = () => {
  const [showOrderHistory, setShowOrderHistory] = useState(false)

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [startDate, endDate] = dateRange
  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <div className="d-flex card-header justify-content-between align-items-center">
              <div>
                <CardTitle as={'h4'}>Customer Membership History </CardTitle>
              </div>

              <Dropdown>
                <DropdownToggle className="btn btn-sm btn-outline-light content-none icons-center" data-bs-toggle="dropdown" aria-expanded="false">
                  This Month <IconifyIcon className="ms-1" width={16} height={16} icon="bx:chevron-down" />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem href="" className="dropdown-item">
                    Download
                  </DropdownItem>
                  <DropdownItem href="" className="dropdown-item">
                    Export
                  </DropdownItem>
                  <DropdownItem href="" className="dropdown-item">
                    Import
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
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
                      <th style={{ textWrap: 'nowrap' }}>Full Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Email Address</th>
                      <th style={{ textWrap: 'nowrap' }}>Phone Numbber</th>
                      <th style={{ textWrap: 'nowrap' }}>Selected Meal Plan</th>
                      <th style={{ textWrap: 'nowrap' }}>Meal Plan Start</th>
                      <th style={{ textWrap: 'nowrap' }}>Meal Plan End</th>

                      <th style={{ textWrap: 'nowrap' }}>Payment Mode</th>

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
                      <td style={{ textWrap: 'nowrap' }}>Suraj Jamdade</td>
                      <td style={{ textWrap: 'nowrap' }}>Suraj@gmail.com</td>
                      <td style={{ textWrap: 'nowrap' }}>1234567890</td>
                      <td style={{ textWrap: 'nowrap' }}>International Meal plan</td>
                      <td style={{ textWrap: 'nowrap' }}>10 sept 2025</td>
                      <td style={{ textWrap: 'nowrap' }}>10 Oct 2025</td>
                      <td style={{ textWrap: 'nowrap' }}>Online</td>

                      <td>
                        <div className="d-flex gap-2">
                          <Link href="/meal-plan-order-history-view" className="btn btn-light btn-sm">
                            <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                          </Link>
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

      <Modal show={showOrderHistory} onHide={() => setShowOrderHistory(false)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Meal Plan Hold</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ width: '100%' }}>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable
              className="form-control"
              placeholderText="Select date range"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderHistory(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => setShowOrderHistory(false)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CustomerMenbershipList
