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
import waiter from '@/assets/images/users/avatar-1.jpg'

const CashExpenseList = async () => {
  const customerData = await getAllOrders()

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                All Expense List
              </CardTitle>

              {/* Search Input */}
              <InputGroup style={{ maxWidth: '250px' }}>
                <FormControl placeholder="Search..." />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="mdi:magnify" />
                </Button>
              </InputGroup>

              {/* Month Filter Dropdown */}
              <Link href="/expenses/add-expense" className="btn btn-lg btn-primary">
                + Add Expense
              </Link>
            </CardHeader>

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3">
              {/* Month Filter Dropdown */}
              <select style={{ maxWidth: '200px' }} className="form-select form-select-sm p-1">
                <option value="all">Select Month</option>
                <option value="january">January</option>
                <option value="february">February</option>
                <option value="march">March</option>
                <option value="april">April</option>
                <option value="may">May</option>
                <option value="june">June</option>
                <option value="july">July</option>
                <option value="august">August</option>
                <option value="september">September</option>
                <option value="october">October</option>
                <option value="november">November</option>
                <option value="december">December</option>
              </select>
              {/* Month Filter Dropdown */}
              <select style={{ maxWidth: '200px' }} className="form-select form-select-sm p-1">
                <option value="all">Select Download</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
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
                      <th style={{ textWrap: 'nowrap' }}>Invoice ID</th>
                      <th style={{ textWrap: 'nowrap' }}>Invoice Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Expense Type</th>
                      <th style={{ textWrap: 'nowrap' }}>Description / Purpose</th>
                      <th style={{ textWrap: 'nowrap' }}>Supplier Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Payment Method</th>
                      <th style={{ textWrap: 'nowrap' }}>Total Amount</th>
                      <th style={{ textWrap: 'nowrap' }}>Approved By</th>
                      <th style={{ textWrap: 'nowrap' }}>Notes / Remarks</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textWrap: 'nowrap' }}>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="customCheck2" />
                          <label className="form-check-label" htmlFor="customCheck2" />
                        </div>
                      </td>
                      <td style={{ textWrap: 'nowrap' }}>#001</td>
                      <td style={{ textWrap: 'nowrap' }}>01 Aug 1995</td>
                      <td style={{ textWrap: 'nowrap' }}>Maintance</td>
                      <td style={{ textWrap: 'nowrap' }}>Maintance</td>
                      <td style={{ textWrap: 'nowrap' }}>Raj Jamdade</td>
                      <td style={{ textWrap: 'nowrap' }}>
                        <span className="badge bg-success">Cash</span>
                      </td>
                      <td style={{ textWrap: 'nowrap' }}>AED 2000</td>
                      <td style={{ textWrap: 'nowrap' }}>Admin</td>
                      <td style={{ textWrap: 'nowrap' }}>Done</td>
                      {/* Status */}
                      <td style={{ textWrap: 'nowrap' }}>
                        <div className="d-flex gap-2">
                          <Link href="/expenses/expenses-edit" className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <Link href="" className="btn btn-soft-danger btn-sm">
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </Link>
                        </div>
                      </td>{' '}
                      {/* Actions */}
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

export default CashExpenseList
