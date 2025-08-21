"use client"

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Button, Card, CardFooter, CardHeader, CardTitle, Col, FormControl, InputGroup, Row } from 'react-bootstrap'
import { apiFetch } from '@/utils/api'
import { useSession } from 'next-auth/react'

type MealPlanItem = {
  _id: string
  title: string
  category?: string
  brand?: string
  price?: number
  status?: string
  thumbnail?: { url?: string; secure_url?: string } | string
  images?: ({ url?: string; secure_url?: string } | string)[]
}

const MealPlan = () => {
  const { data: session } = useSession()
  const [items, setItems] = useState<MealPlanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const res = await apiFetch<{ data: MealPlanItem[] }>(`/meal-plans?limit=50${q ? `&search=${encodeURIComponent(q)}` : ''}`)
      setItems(res.data || [])
    } catch (e) {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onDelete = async (id: string) => {
    if (!confirm('Delete this meal plan?')) return
    try {
      const token = (session as any)?.user?.token as string | undefined
      await apiFetch(`/meal-plans/${id}`, { method: 'DELETE' }, token)
      setItems((prev) => prev.filter((x) => x._id !== id))
    } catch (e: any) {
      alert(e?.message || 'Failed to delete')
    }
  }
  const getImgUrl = (u?: any): string | undefined => {
    if (!u) return undefined
    if (typeof u === 'string') return u
    return u.url || u.secure_url
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <CardTitle as="h4" className="mb-0 flex-grow-1">
              Meal plan List
            </CardTitle>

            {/* Search Input */}
            <InputGroup style={{ maxWidth: '250px' }}>
              <FormControl placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
              <Button variant="outline-secondary" onClick={load}>
                <IconifyIcon icon="mdi:magnify" />
              </Button>
            </InputGroup>

            {/* Month Filter Dropdown */}
            <Link href="/meal-plan/add-meal-plan" className="btn btn-sm btn-primary">
              Add Meal
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
                    <th>Banner</th>
                    <th>Title</th>
                    <th>Meal Plan Category</th>
                    <th>Brands</th>
                    <th>Price</th>

                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8}>Loading...</td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={8}>No meal plans found</td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="customCheck2" />
                            <label className="form-check-label" htmlFor="customCheck2" />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={
                                  getImgUrl(item.thumbnail) ||
                                  (item.images && item.images.length ? getImgUrl(item.images[0]) : undefined) ||
                                  '/placeholder.svg'
                                }
                                alt="thumb"
                                className="avatar-md rounded"
                              />
                            </div>
                          </div>
                        </td>
                        <td>{item.title}</td>
                        <td>{item.category || '-'}</td>
                        <td>{item.brand || '-'}</td>
                        <td>{item.price ?? '-'}</td>

                        <td>
                          <span className="badge bg-success">{item.status || 'active'}</span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/meal-plan/meal-plan-view?id=${item._id}`} className="btn btn-light btn-sm">
                              <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                            </Link>
                            <Link href={`/meal-plan/meal-plan-edit?id=${item._id}`} className="btn btn-soft-primary btn-sm">
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <button onClick={() => onDelete(item._id)} className="btn btn-soft-danger btn-sm">
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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

export default MealPlan
