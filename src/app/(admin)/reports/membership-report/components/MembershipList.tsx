import TextFormInput from '@/components/form/TextFormInput'
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
import { Form } from 'react-hook-form'

const MembershipList = () => {
  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                Membership Report
              </CardTitle>

              {/* Search Input */}
              {/* <InputGroup style={{ maxWidth: '250px' }}>
                <FormControl placeholder="Search..." />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="mdi:magnify" />
                </Button>
              </InputGroup> */}
              <div className="mb-3">
                <label htmlFor="" className="form-label">
                  From
                </label>
                <input type="date" name="stock" placeholder="Enter Stock" className="form-control" />
              </div>
              <div className="mb-3">
                <label htmlFor="" className="form-label">
                  To
                </label>
                <input type="date" name="stock" placeholder="Enter Stock" className="form-control" />
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
                      <th style={{ textWrap: 'nowrap' }}>Invoice Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Bill Number</th>
                      <th style={{ textWrap: 'nowrap' }}>Customer Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Meal</th>
                      <th style={{ textWrap: 'nowrap' }}>Total</th>
                      <th style={{ textWrap: 'nowrap' }}>Disc</th>
                      <th style={{ textWrap: 'nowrap' }}>Vat</th>
                      <th style={{ textWrap: 'nowrap' }}>Deli.Cha</th>
                      <th style={{ textWrap: 'nowrap' }}>Grand Total</th>
                      <th style={{ textWrap: 'nowrap' }}>Cash Amt</th>
                      <th style={{ textWrap: 'nowrap' }}>Card Amt</th>
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

                      <td style={{ textWrap: 'nowrap' }}>01 Aug 2025</td>
                      <td style={{ textWrap: 'nowrap' }}>3581</td>
                      <td style={{ textWrap: 'nowrap' }}>Ms Round AL Ali</td>
                      <td style={{ textWrap: 'nowrap' }}>
                        <span className="badge bg-success">wl 3 Meal </span>
                        <span className="badge bg-success">1 S </span>
                      </td>
                      <td style={{ textWrap: 'nowrap' }}>951.43</td>
                      <td style={{ textWrap: 'nowrap' }}>0.00</td>
                      <td style={{ textWrap: 'nowrap' }}>47.57</td>
                      <td style={{ textWrap: 'nowrap' }}>0.00</td>
                      <td style={{ textWrap: 'nowrap' }}>999.00</td>
                      <td style={{ textWrap: 'nowrap' }}>0.00</td>
                      <td style={{ textWrap: 'nowrap' }}>999.00</td>

                      <td>
                        <div className="d-flex gap-2">
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

export default MembershipList