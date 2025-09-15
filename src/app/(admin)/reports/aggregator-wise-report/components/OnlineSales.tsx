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

import banner1 from '@/assets/images/onlinesales/1.png'
import banner2 from '@/assets/images/onlinesales/2.png'
import banner3 from '@/assets/images/onlinesales/3.png'
import banner4 from '@/assets/images/onlinesales/4.jpg'
import banner5 from '@/assets/images/onlinesales/5.png'
import banner6 from '@/assets/images/onlinesales/6.png'

const OnlineSales = () => {
  const data = [
    {
      id: 1,
      banner: banner1,
      title: 'zomato',
      status: 'Active',
    },
    {
      id: 2,
      banner: banner2,
      title: 'Talabat',
      status: 'Active',
    },
    {
      id: 3,
      banner: banner3,
      title: 'Deliveroo',
      status: 'Active',
    },
    {
      id: 4,
      banner: banner4,
      title: 'Uber Eats',
      status: 'Active',
    },
    {
      id: 5,
      banner: banner5,
      title: 'Swiggy',
      status: 'Active',
    },
    {
      id: 6,
      banner: banner6,
      title: 'Foodpanda',
      status: 'Active',
    },
  ]

  return (
    <>
      <Row>
        {data.map((item) => (
          <Col xs={12} md={4} lg={4} xl={4} key={item.id}>
            <Card className="text-center p-2">
              <div style={{ width: '100px', height: '50px', margin: '0 auto' }}>
                <Image
                  src={item.banner}
                  alt=""
                  width={50}
                  height={50}
                  className="img-fluid rounded"
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                />
              </div>
              <h5 className="text-info mt-2">AED 300</h5>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                Online Sales Report
              </CardTitle>

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
                      <th style={{ textWrap: 'nowrap' }}>Invoice No.</th>
                      <th style={{ textWrap: 'nowrap' }}>Order Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Customer Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Aggregators Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Order Items</th>
                      <th style={{ textWrap: 'nowrap' }}>Payment Mode</th>
                      <th style={{ textWrap: 'nowrap' }}>Subtotal</th>
                      <th style={{ textWrap: 'nowrap' }}>Vat</th>
                      <th style={{ textWrap: 'nowrap' }}>Discount</th>
                      <th style={{ textWrap: 'nowrap' }}>Shipping Charge</th>
                      <th style={{ textWrap: 'nowrap' }}>Total Amount</th>
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
                      <td style={{ textWrap: 'nowrap' }}>30 Aug 2025</td>
                      <td style={{ textWrap: 'nowrap' }}>Suraj jamdade</td>
                      <td style={{ textWrap: 'nowrap' }}>
                        <span className="badge bg-danger">Zomato</span>
                      </td>

                      <td style={{ textWrap: 'nowrap' }}>
                        <span className="badge bg-success">Biryani</span>
                        <span className="badge bg-success">Chicken</span>
                        <span className="badge bg-success">Tandoor Chiken</span>
                      </td>

                      <td style={{ textWrap: 'nowrap' }}>Cash</td>
                      <td style={{ textWrap: 'nowrap' }}>AED 500</td>
                      <td style={{ textWrap: 'nowrap' }}>0%</td>
                      <td style={{ textWrap: 'nowrap' }}>AED 0</td>
                      <td style={{ textWrap: 'nowrap' }}>AED 0</td>
                      <td style={{ textWrap: 'nowrap' }}>AED 500</td>

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

export default OnlineSales
