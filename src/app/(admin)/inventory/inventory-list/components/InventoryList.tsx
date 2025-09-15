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

const InventoryList = async () => {
  const categoryData = await getAllOrders()

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <CardTitle as="h4" className="mb-0 flex-grow-1">
              All Inventory List
            </CardTitle>

            {/* Search Input */}
            <InputGroup style={{ maxWidth: '250px' }}>
              <FormControl placeholder="Search..." />
              <Button variant="outline-secondary">
                <IconifyIcon icon="mdi:magnify" />
              </Button>
            </InputGroup>

            {/* Month Filter Dropdown */}
            <Link href="/inventory/add-inventory" className="btn btn-lg btn-primary">
              + Add Inventory
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
                    <th style={{ textWrap: 'nowrap' }}>Item Name</th>
                    <th style={{ textWrap: 'nowrap' }}>Categories</th>
                    <th style={{ textWrap: 'nowrap' }}>Tag ID / SKU</th>
                    <th style={{ textWrap: 'nowrap' }}>Stock Quantity</th>
                    <th style={{ textWrap: 'nowrap' }}>Unit of Measure</th>
                    <th style={{ textWrap: 'nowrap' }}>Reorder Level</th>
                    <th style={{ textWrap: 'nowrap' }}>Purchase Price </th>
                    <th style={{ textWrap: 'nowrap' }}>Selling Price </th>
                    <th style={{ textWrap: 'nowrap' }}>Supplier Name </th>
                    <th style={{ textWrap: 'nowrap' }}>Purchase Date </th>
                    <th style={{ textWrap: 'nowrap' }}>Expiry Date </th>
                    <th style={{ textWrap: 'nowrap' }}>Storage Location </th>
                    <th style={{ textWrap: 'nowrap' }}>Description </th>
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
                    <td style={{ textWrap: 'nowrap' }}>Paner</td>
                    <td style={{ textWrap: 'nowrap' }}>Dairy</td>
                    <td style={{ textWrap: 'nowrap' }}>#232323232</td>
                    <td style={{ textWrap: 'nowrap' }}>100</td>
                    <td style={{ textWrap: 'nowrap' }}>kg</td>
                    <td style={{ textWrap: 'nowrap' }}>50</td>
                    <td style={{ textWrap: 'nowrap' }}>AED 100</td>
                    <td style={{ textWrap: 'nowrap' }}>AED 100</td>
                    <td style={{ textWrap: 'nowrap' }}>Suraj Jamdade</td>
                    <td style={{ textWrap: 'nowrap' }}>10 Aug 2025</td>
                    <td style={{ textWrap: 'nowrap' }}>10 Aug 2025</td>
                    <td style={{ textWrap: 'nowrap' }}>Abu Dhabi</td>
                    <td style={{ textWrap: 'nowrap' }}>Good Quality</td>
                    <td style={{ textWrap: 'nowrap' }}>
                      <div className="d-flex gap-2">
                        <Link href="/inventory/inventory-edit" className="btn btn-soft-primary btn-sm">
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
  )
}

export default InventoryList
