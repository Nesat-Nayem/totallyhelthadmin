import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'

const data = [
  {
    id: 1,
    name: 'suraj jamdade',
    designation: 'Developer',
    desc: 'Cooking up made-to-order meal plans to help you look and feel fantastic! Choose from thousands of meal combinations and get healthy, nutritious and delicious meals delivered straight to your door.',
    status: 'Active',
  },
]

const Testimonial = async () => {
  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Testimonials
            </CardTitle>
            <Link href="/pages/testimonial/testimonial-add" className="btn btn-lg btn-primary">
              Add testimonial
            </Link>
          </CardHeader>
          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ width: 20 }}>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="customCheck1" />
                        <label className="form-check-label" htmlFor="customCheck1" />
                      </div>
                    </th>
                    <th style={{ textWrap: 'nowrap' }}>Name</th>
                    <th style={{ textWrap: 'nowrap' }}>Designation</th>
                    <th style={{ textWrap: 'nowrap' }}>Description</th>
                    <th style={{ textWrap: 'nowrap' }}>Status</th>
                    <th style={{ textWrap: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="customCheck2" />
                          <label className="form-check-label" htmlFor="customCheck2" />
                        </div>
                      </td>

                      <td style={{ textWrap: 'nowrap' }}>{item.name}</td>
                      <td style={{ textWrap: 'nowrap' }}>{item.designation}</td>
                      <td style={{ textWrap: 'nowrap' }}>{item.desc}</td>
                      <td style={{ textWrap: 'nowrap' }} className={`fw-medium text-success`}>
                        {item.status}
                      </td>
                      <td style={{ textWrap: 'nowrap' }}>
                        <div className="d-flex gap-2">
                          <Link href="/pages/testimonial/testimonial-edit" className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <Link href="" className="btn btn-soft-danger btn-sm">
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
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
  )
}

export default Testimonial
