import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import banner1 from '../../../../../assets/images/banner/1.jpg'
import banner2 from '../../../../../assets/images/banner/2.jpg'
import banner3 from '../../../../../assets/images/banner/3.jpg'

const data = [
  {
    id: 1,
    banner: banner1,
    title: 'The tastiest and easiest way to lose weight fast.',
    price: 'AED 40',
    category: 'Breakfast',
    status: 'Active',
  },
  {
    id: 2,
    banner: banner2,
    title: 'The tastiest and easiest way to lose weight fast.',
    price: 'AED 50',
    category: 'Breakfast',
    status: 'Active',
  },
  {
    id: 3,
    banner: banner3,
    title: 'The tastiest and easiest way to lose weight fast.',
    price: 'AED 20',
    category: 'Breakfast',
    status: 'Active',
  },
]

const RestaurantsMenu = async () => {
  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Restaurants Menu
            </CardTitle>
            <Link href="/pages/restaurants-menu/restaurants-menu-add" className="btn btn-sm btn-primary">
              Add Menu
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
                    <th>Banner</th>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Action</th>
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
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                            <Image src={item.banner} alt="product" className="avatar-md" />
                          </div>
                        </div>
                      </td>
                      <td>{item.title}</td>
                      <td>{item.price}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className="badge bg-success">{item.status}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href="/pages/restaurants-menu/restaurants-menu-edit" className="btn btn-soft-primary btn-sm">
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

export default RestaurantsMenu
