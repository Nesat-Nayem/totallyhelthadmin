"use client"

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import { Button, Card, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useGetMenuCategoriesQuery, useDeleteMenuCategoryMutation } from '@/services/menuCategoryApi'

const RestaurantsMenuCategory = () => {
  const { data: categories } = useGetMenuCategoriesQuery()
  const [deleteCategory] = useDeleteMenuCategoryMutation()

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category?')) {
      try {
        await deleteCategory(id).unwrap()
        alert('Deleted successfully')
      } catch (e: any) {
        alert(e?.data?.message || 'Failed to delete')
      }
    }
  }
  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Menu Category
            </CardTitle>
            <Link href="/menu-master/menu-category/restaurants-menu-category-add" className="btn btn-lg btn-primary">
              + Add Category
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
                    <th>Title</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(categories ?? []).map((item: any) => (
                    <tr key={item._id}>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="customCheck2" />
                          <label className="form-check-label" htmlFor="customCheck2" />
                        </div>
                      </td>

                      <td>{item.title}</td>

                      <td>
                        <span className={item.status === 'active' ? 'badge badge-soft-success' : 'badge badge-soft-danger'}>{item.status}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/menu-master/menu-category/restaurants-menu-category-edit?id=${item._id}`} className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <Button onClick={() => handleDelete(item._id)} className="btn btn-soft-danger btn-sm">
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </Button>
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

export default RestaurantsMenuCategory
