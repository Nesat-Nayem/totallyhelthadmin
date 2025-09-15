import IconifyIcon from '@/components/wrappers/IconifyIcon'
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
import banner1 from '../../../../../assets/images/sample-menu/biryani.jpg'

const data = [
  {
    id: 1,
    banner: banner1,
    title: 'Biryani',
    category: 'Lunch',
    price: 'AED 5.99',
    priceCategory: 'Restaurant',
    fat: '20g',
    protein: '20g',
    carbs: '20g',
    calories: '20g',
    fiber: '20g',
    cholesterol: '20g',
    sodium: '20g',
    sugars: '20g',
    calcium: '20g',
    vitaminC: '20g',
    desc: 'Cooking up made-to-order meal plans to help you look and feel fantastic! Choose from thousands of meal combinations and get healthy, nutritious and delicious meals delivered straight to your door.',
    status: 'Active',
  },
]

const Menu = async () => {
  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Menu Items List
            </CardTitle>
            {/* Search Input */}
            <InputGroup style={{ maxWidth: '250px' }}>
              <FormControl placeholder="Search menu..." type="search" />
            </InputGroup>

            {/* category */}
            <select style={{ maxWidth: '200px' }} className="form-select form-select-sm p-1">
              <option value="all">Select Category</option>
              <option value="restaurant">Restaurant</option>
              <option value="online">Online</option>
              <option value="membership">Membership</option>
            </select>
            <Link href="/pages/menu/menu-add" className="btn btn-lg btn-primary">
              + Add Menu
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
                    <th style={{ textWrap: 'nowrap' }}>Menu Banner</th>
                    <th style={{ textWrap: 'nowrap' }}>Title</th>
                    <th style={{ textWrap: 'nowrap' }}> Category</th>
                    <th style={{ textWrap: 'nowrap' }}>Price </th>
                    <th style={{ textWrap: 'nowrap' }}>Price Category</th>
                    <th style={{ textWrap: 'nowrap' }}>Fat (g)</th>
                    <th style={{ textWrap: 'nowrap' }}>Protein (g)</th>
                    <th style={{ textWrap: 'nowrap' }}>Carbs (g)</th>
                    <th style={{ textWrap: 'nowrap' }}>Calories (kcal)</th>
                    <th style={{ textWrap: 'nowrap' }}>Fiber (g)</th>
                    <th style={{ textWrap: 'nowrap' }}>Sodium (mg)</th>
                    <th style={{ textWrap: 'nowrap' }}>Sugars (g)</th>
                    <th style={{ textWrap: 'nowrap' }}>calcium (mg)</th>
                    <th style={{ textWrap: 'nowrap' }}>vitaminC (mg)</th>
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
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                            <Image src={item.banner} alt="product" className="avatar-md" />
                          </div>
                        </div>
                      </td>
                      <td>{item.title}</td>
                      <td>{item.category}</td>
                      <td>{item.price}</td>
                      <td>
                        <span className="badge bg-success">{item.priceCategory}</span>
                      </td>
                      <td>{item.fat}</td>
                      <td>{item.protein}</td>
                      <td>{item.carbs}</td>
                      <td>{item.calories}</td>
                      <td>{item.fiber}</td>

                      <td>{item.sodium}</td>
                      <td>{item.sugars}</td>
                      <td>{item.calcium}</td>
                      <td>{item.vitaminC}</td>
                      <td>{item.desc.slice(0, 20)}</td>

                      <td>
                        <span className="badge bg-success">{item.status} </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href="/pages/menu/menu-edit" className="btn btn-soft-primary btn-sm">
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

export default Menu
