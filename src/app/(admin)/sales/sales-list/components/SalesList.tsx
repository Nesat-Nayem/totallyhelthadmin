import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getAllOrders } from '@/helpers/data'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardFooter, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'

const SalesList = () => {
  return (
    <>
      <Row>
        <Col lg={4}>
          <Card>
            <div className="p-3 text-center d-flex align-items-center gap-3">
              <div>
                <IconifyIcon icon="solar:file-text-broken" className="align-middle fs-24" />
              </div>
              <div>
                <h5>Total Sales</h5>
                <h5>
                  <span className="text-success">AED 2000</span>
                </h5>
              </div>
            </div>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <div className="p-3 text-center d-flex align-items-center gap-3">
              <div>
                <IconifyIcon icon="solar:file-text-broken" className="align-middle fs-24" />
              </div>
              <div>
                <h5>This Month Sales</h5>
                <h5>
                  <span className="text-success">AED 2000</span>
                </h5>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card>
            <div className="d-flex card-header justify-content-between align-items-center">
              <div>
                <CardTitle as={'h4'}>Sales List </CardTitle>
              </div>
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
                      <th style={{ textWrap: 'nowrap' }}>Sr.No</th>
                      <th style={{ textWrap: 'nowrap' }}>Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Invoice No</th>
                      <th style={{ textWrap: 'nowrap' }}>Full Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Total</th>
                      <th style={{ textWrap: 'nowrap' }}>Discount</th>
                      <th style={{ textWrap: 'nowrap' }}>Paid Status</th>
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
                      <td style={{ textWrap: 'nowrap' }}>1</td>
                      <td style={{ textWrap: 'nowrap' }}>01 Aug 2025</td>
                      <td style={{ textWrap: 'nowrap' }}>S001</td>
                      <td style={{ textWrap: 'nowrap' }}>Suraj Jamdade</td>
                      <td style={{ textWrap: 'nowrap' }}>AED 200</td>
                      <td style={{ textWrap: 'nowrap' }}>AED 20</td>
                      <td style={{ textWrap: 'nowrap' }}>
                        <span className="badge bg-success">Paid</span>
                      </td>
                      <td style={{ textWrap: 'nowrap' }}>UPI</td>

                      <td>
                        <div className="d-flex gap-2">
                          <Link href="/sales/invoice" className="btn btn-light btn-sm">
                            <IconifyIcon icon="solar:file-text-broken" className="align-middle fs-18" />
                          </Link>
                          <Link href="/sales/pos" className="btn btn-soft-primary btn-sm">
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

export default SalesList
