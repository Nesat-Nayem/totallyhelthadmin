"use client"

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button, Card, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useGetMenuCategoriesQuery, useDeleteMenuCategoryMutation } from '@/services/menuCategoryApi'
import { toast } from 'react-toastify'

const RestaurantsMenuCategory = () => {
  const { data: categories, isLoading, isFetching } = useGetMenuCategoriesQuery()
  const [deleteCategory] = useDeleteMenuCategoryMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        setDeletingId(id)
        await deleteCategory(id).unwrap()
        toast.success('Category deleted successfully')
      } catch (e: any) {
        toast.error(e?.data?.message || 'Failed to delete category')
      } finally {
        setDeletingId(null)
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
            <Link href="/menu-master/menu-category-add" className="btn btn-lg btn-primary">
              + Add Menu Category
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
                  {(isLoading || isFetching) && (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Loading categories...
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isFetching && (!categories || categories.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-4">No categories found</td>
                    </tr>
                  )}
                  {!isLoading && !isFetching && (categories ?? []).map((item: any) => (
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
                          <Link href={`/menu-master/menu-category-edit?id=${item._id}`} className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <Button 
                            onClick={() => handleDelete(item._id)} 
                            className="btn btn-soft-danger btn-sm"
                            disabled={deletingId === item._id}
                          >
                            {deletingId === item._id ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            ) : (
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                            )}
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
