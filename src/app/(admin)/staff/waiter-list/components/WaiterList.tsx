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

const WaiterList = async () => {
  const customerData = await getAllOrders()

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                All Waiter List
              </CardTitle>

              {/* Search Input */}
              <InputGroup style={{ maxWidth: '250px' }}>
                <FormControl placeholder="Search..." />
                <Button variant="outline-secondary">
                  <IconifyIcon icon="mdi:magnify" />
                </Button>
              </InputGroup>

              {/* Month Filter Dropdown */}
              <Link href="/staff/waiter-add" className="btn btn-lg btn-primary">
                + Add Waiter
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
                      <th style={{ textWrap: 'nowrap' }}>Waiter ID / Employee Code</th>
                      <th style={{ textWrap: 'nowrap' }}>Waiter Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Profile Photo</th>
                      <th style={{ textWrap: 'nowrap' }}>Gender</th>
                      <th style={{ textWrap: 'nowrap' }}>Date of Birth</th>
                      <th style={{ textWrap: 'nowrap' }}>Date of Joining</th>
                      <th style={{ textWrap: 'nowrap' }}>Shift Type</th>
                      <th style={{ textWrap: 'nowrap' }}>Branch</th>
                      <th style={{ textWrap: 'nowrap' }}>Position</th>
                      <th style={{ textWrap: 'nowrap' }}>Reporting Manager</th>
                      <th style={{ textWrap: 'nowrap' }}>Nationality</th>
                      <th style={{ textWrap: 'nowrap' }}>Contact Number</th>
                      <th style={{ textWrap: 'nowrap' }}>Email Address</th>
                      <th style={{ textWrap: 'nowrap' }}> Address</th>
                      <th style={{ textWrap: 'nowrap' }}> Salary</th>
                      <th style={{ textWrap: 'nowrap' }}> Bank Name</th>
                      <th style={{ textWrap: 'nowrap' }}> Account Number</th>
                      <th style={{ textWrap: 'nowrap' }}> IFSC Code</th>
                      <th style={{ textWrap: 'nowrap' }}> Language known</th>
                      <th style={{ textWrap: 'nowrap' }}> Status</th>
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
                      <td style={{ textWrap: 'nowrap' }}>#001</td> {/* Waiter ID */}
                      <td style={{ textWrap: 'nowrap' }}>Suraj Jamdade</td> {/* Name */}
                      <td style={{ textWrap: 'nowrap' }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                            <Image src={waiter} alt="waiter" className="avatar-md" />
                          </div>
                        </div>
                      </td>{' '}
                      {/* Photo */}
                      <td style={{ textWrap: 'nowrap' }}>Male</td> {/* Gender */}
                      <td style={{ textWrap: 'nowrap' }}>01 Aug 1995</td> {/* DOB */}
                      <td style={{ textWrap: 'nowrap' }}>15 Jan 2022</td> {/* Date of Joining */}
                      <td style={{ textWrap: 'nowrap' }}>Morning Shift</td> {/* Shift Type */}
                      <td style={{ textWrap: 'nowrap' }}>Dubai Branch</td> {/* Branch */}
                      <td style={{ textWrap: 'nowrap' }}>Senior Waiter</td> {/* Position */}
                      <td style={{ textWrap: 'nowrap' }}>John Manager</td> {/* Reporting Manager */}
                      <td style={{ textWrap: 'nowrap' }}>Indian</td> {/* Nationality */}
                      <td style={{ textWrap: 'nowrap' }}>+91 9876543210</td> {/* Contact */}
                      <td style={{ textWrap: 'nowrap' }}>raj@gmail.com</td> {/* Email */}
                      <td style={{ textWrap: 'nowrap' }}>Dubai, UAE</td> {/* Address */}
                      <td style={{ textWrap: 'nowrap' }}>₹25,000</td> {/* Salary */}
                      <td style={{ textWrap: 'nowrap' }}>HDFC Bank</td> {/* Bank */}
                      <td style={{ textWrap: 'nowrap' }}>1234567890</td> {/* Account No */}
                      <td style={{ textWrap: 'nowrap' }}>HDFC0001234</td> {/* IFSC */}
                      <td style={{ textWrap: 'nowrap' }}>English, Hindi</td> {/* Languages */}
                      <td style={{ textWrap: 'nowrap' }}>
                        <span className="badge bg-success">Active</span>
                      </td>{' '}
                      {/* Status */}
                      <td style={{ textWrap: 'nowrap' }}>
                        <div className="d-flex gap-2">
                          <Link href="/staff/waiter-edit" className="btn btn-soft-primary btn-sm">
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

export default WaiterList
