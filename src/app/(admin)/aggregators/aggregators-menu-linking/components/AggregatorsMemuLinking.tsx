import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import {
  Card,
  CardBody,
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
import banner1 from '../../../../../assets/images/onlinesales/1.png'
import banner2 from '../../../../../assets/images/onlinesales/2.png'
import banner3 from '../../../../../assets/images/onlinesales/3.png'

const data = [
  {
    id: 1,
    invoice: '001',
    title: 'Zomato',
    MenuName: 'Biryani',
    logo: banner1,
    deliveryDate: '01-sept-2025',
    subtotal: 'AED 5.99',
    paymentMode: 'online',
    paymentStatus: 'Paid',
    status: 'Active',
  },
]

const AggregatorsMemuLinking = async () => {
  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Aggregators Delivery List
            </CardTitle>

            {/* Search Input */}
            <InputGroup style={{ maxWidth: '250px' }}>
              <FormControl placeholder="Search..." />
            </InputGroup>
          </CardHeader>
          <CardBody>
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
                      <th>Invoice Number</th>
                      <th>Aggregators Name</th>
                      <th>Menu Name</th>
                      <th>Logo</th>
                      <th>Delivery Date</th>
                      <th>Subtotal</th>
                      <th>Payment Mode</th>
                      <th>Payment Status</th>
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

                        <td>{item.invoice}</td>
                        <td>{item.title}</td>
                        <td>{item.MenuName}</td>
                        <td>
                          <Image src={item.logo} alt="" width={50} height={50} className="img-fluid rounded" />
                        </td>
                        <td>{item.deliveryDate}</td>
                        <td>{item.subtotal}</td>
                        <td>{item.paymentMode}</td>

                        <td>
                          <span className={item.status === 'Active' ? 'badge badge-soft-success' : 'badge badge-soft-danger'}>
                            {item.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
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
          </CardBody>
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

export default AggregatorsMemuLinking
