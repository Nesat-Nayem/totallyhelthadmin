import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getAllOrders } from '@/helpers/data'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
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
import PunchModal from './PunchModal'

const CustomerDataList = async () => {
  const customerData = await getAllOrders()

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                All Customers List
              </CardTitle>

              {/* Search Input */}
              <InputGroup style={{ maxWidth: '250px' }}>
                <FormControl placeholder="Search..." />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="mdi:magnify" />
                </Button>
              </InputGroup>

              {/* Month Filter Dropdown */}
              <Link href="/customer/customer-add" className="btn btn-lg btn-primary">
                + Add Customers
              </Link>
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
                      <th style={{ textWrap: 'nowrap' }}>Customer Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Email</th>
                      <th style={{ textWrap: 'nowrap' }}>Phone</th>
                      <th style={{ textWrap: 'nowrap' }}>Meal Plan Start Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Meal Plan End Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Pending Total Meals</th>
                      <th style={{ textWrap: 'nowrap' }}>Status</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="customCheck2" />
                          <label className="form-check-label" htmlFor="customCheck2" />
                        </div>
                      </td>
                      <td style={{ textWrap: 'nowrap' }}>Suraj Jamdade</td>
                      <td style={{ textWrap: 'nowrap' }}>Suraj@gmail.com</td>
                      <td style={{ textWrap: 'nowrap' }}>+91 9876543210</td>
                      <td style={{ textWrap: 'nowrap' }}>01 Aug 2025</td>
                      <td style={{ textWrap: 'nowrap' }}>01 Dec 2025</td>
                      <td style={{ textWrap: 'nowrap' }}>8</td>
                      <td style={{ textWrap: 'nowrap' }}>
                        <span className="badge bg-success">Active</span>
                      </td>
                      <td style={{ textWrap: 'nowrap' }}>
                        <div className="d-flex gap-2">
                          <PunchModal />
                          <Link href="/customer/customer-edit" className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
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
    </>
  )
}

export default CustomerDataList
