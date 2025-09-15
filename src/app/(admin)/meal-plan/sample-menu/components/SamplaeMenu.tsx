'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import banner1 from '../../../../../assets/images/sample-menu/1.webp'

const data = [
  {
    id: 1,
    mealType: 'Breakfast',
    status: 'Active',
    days: [
      {
        banner: banner1,
        name: 'Fatteh Eggs',
        description: 'A blend of scrambled eggs with chickpeas, yogurt & crispy bread.',
      },
      {
        banner: banner1,
        name: 'Date Caramel Oatmeal',
        description: 'Creamy oatmeal made with oat milk, date caramel & cinnamon.',
      },
      {
        banner: banner1,
        name: 'Protein Bread',
        description: 'Multigrain bread with grilled halloumi and labneh.',
      },
      {
        banner: banner1,
        name: 'Cardamom Pancakes',
        description: 'Whole wheat pancakes with cardamom & honey.',
      },
      {
        banner: banner1,
        name: 'Traditional Breakfast',
        description: 'Paratha, curd, and seasonal fruits.',
      },
    ],
  },
]

// eslint-disable-next-line @next/next/no-async-client-component
const SamplaeMenu = async () => {
  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as="h4" className="flex-grow-1">
              Sample Menu List
            </CardTitle>
            <Link href="/meal-plan/sample-menu/sample-menu-add" className="btn btn-lg btn-primary">
              + Add Sample Menu
            </Link>
          </CardHeader>

          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover text-center table-bordered">
              <thead>
                <tr>
                  <th>Meals / Days</th>
                  <th className="bg-warning-subtle">Day 1</th>
                  <th className="bg-success-subtle">Day 2</th>
                  <th className="bg-purple-subtle">Day 3</th>
                  <th className="bg-info-subtle">Day 4</th>
                  <th className="bg-primary-subtle">Day 5</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <th>{item.mealType}</th>

                    {item.days.map((day, index) => (
                      <td key={index}>
                        <div className="d-flex flex-column align-items-center justify-content-center gap-1">
                          <Image src={day.banner} alt={day.name} width={50} height={50} className="rounded" />
                          <strong>{day.name}</strong>
                          <div className="text-muted small">{day.description}</div>
                        </div>
                      </td>
                    ))}

                    <td>
                      <span className="badge bg-success">{item.status}</span>
                    </td>

                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Link href="/meal-plan/sample-menu/sample-menu-edit" className="btn btn-soft-primary btn-sm">
                          <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                        </Link>
                        <Link href="#" className="btn btn-soft-danger btn-sm">
                          <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CardFooter className="border-top">
            <nav aria-label="Page navigation example">
              <ul className="pagination justify-content-end mb-0">
                <li className="page-item">
                  <Link className="page-link" href="#">
                    Previous
                  </Link>
                </li>
                <li className="page-item active">
                  <Link className="page-link" href="#">
                    1
                  </Link>
                </li>
                <li className="page-item">
                  <Link className="page-link" href="#">
                    2
                  </Link>
                </li>
                <li className="page-item">
                  <Link className="page-link" href="#">
                    3
                  </Link>
                </li>
                <li className="page-item">
                  <Link className="page-link" href="#">
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

export default SamplaeMenu
