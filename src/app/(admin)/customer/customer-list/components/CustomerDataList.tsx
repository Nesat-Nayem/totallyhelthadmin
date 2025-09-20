"use client"

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  FormControl,
  InputGroup,
  Row,
} from 'react-bootstrap'
import { useGetCustomersQuery } from '@/services/customerApi'
import { useGetOrdersQuery, useHoldMembershipMutation, useUnholdMembershipMutation } from '@/services/orderApi'

const formatDate = (d?: string | Date) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleDateString()
  } catch {
    return '-'
  }
}

const CustomerDataList = () => {
  const [query, setQuery] = useState('')
  const { data: customersRes, isLoading: isCustomersLoading } = useGetCustomersQuery({ limit: 500 }) as any
  const { data: membershipOrdersRes, isLoading: isOrdersLoading, error } = useGetOrdersQuery({ limit: 1000, salesType: 'membership' }) as any
  const [holdMembership, { isLoading: isHolding }] = useHoldMembershipMutation()
  const [unholdMembership, { isLoading: isUnholding }] = useUnholdMembershipMutation()

  const customers = useMemo(() => customersRes?.data ?? [], [customersRes])
  const membershipOrders = useMemo(() => membershipOrdersRes?.data ?? [], [membershipOrdersRes])

  // Build a map of latest relevant membership order per customer
  const membershipByCustomer: Record<string, any> = useMemo(() => {
    const map: Record<string, any> = {}
    const today = new Date()
    for (const ord of membershipOrders) {
      const cid = ord.customer?.id
      if (!cid) continue
      // consider only orders with remaining pending meals or endDate in future
      const pending = Number(ord?.membershipStats?.pendingMeals || 0)
      const end = ord.endDate ? new Date(ord.endDate) : undefined
      const active = end ? end >= today : true
      if (pending > 0 && active) {
        const prev = map[cid]
        // pick the latest by startDate or createdAt
        const prevTime = prev ? new Date(prev.startDate || prev.createdAt || 0).getTime() : -1
        const curTime = new Date(ord.startDate || ord.createdAt || 0).getTime()
        if (!prev || curTime >= prevTime) {
          map[cid] = ord
        }
      }
    }
    return map
  }, [membershipOrders])

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c: any) =>
      [c.name, c.email, c.phone].some((f: any) => String(f || '').toLowerCase().includes(q))
    )
  }, [customers, query])

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle as="h4" className="mb-0 flex-grow-1">
                All Customers List
              </CardTitle>

              {/* Search Input */}
              <InputGroup style={{ maxWidth: '250px' }}>
                <FormControl placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
                <Button variant="outline-secondary" onClick={() => { /* no-op; live filter */ }}>
                  <IconifyIcon icon="mdi:magnify" />
                </Button>
              </InputGroup>

              {/* Month Filter Dropdown */}
              <Link href="/customer/customer-add" className="btn btn-lg btn-primary">
                + Add Customers
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
                      <th style={{ textWrap: 'nowrap' }}>Customer Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Email</th>
                      <th style={{ textWrap: 'nowrap' }}>Phone</th>
                      <th style={{ textWrap: 'nowrap' }}>Meal Plan Start Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Meal Plan End Date</th>
                      <th style={{ textWrap: 'nowrap' }}>Pending Total Meals</th>
                      <th style={{ textWrap: 'nowrap' }}>Status</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isCustomersLoading || isOrdersLoading) && (
                      <tr>
                        <td colSpan={9} className="text-center py-4">Loading...</td>
                      </tr>
                    )}
                    {!isCustomersLoading && !isOrdersLoading && filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center py-4">No customers found</td>
                      </tr>
                    )}
                    {!isCustomersLoading && !isOrdersLoading && filteredCustomers.map((c: any) => {
                      const m = membershipByCustomer[c._id]
                      const hasMembership = !!m
                      const pendingMeals = hasMembership ? Number(m.membershipStats?.pendingMeals || 0) : 0
                      const isOnHold = hasMembership ? !!m.membershipStats?.isOnHold : false
                      const start = hasMembership ? formatDate(m.startDate) : '-'
                      const end = hasMembership ? formatDate(m.endDate) : '-'
                      const canToggle = hasMembership
                      const toggleBtn = !canToggle ? null : (
                        isOnHold ? (
                          <Button size="sm" variant="success" disabled={isUnholding} onClick={() => unholdMembership(m._id)}>
                            <IconifyIcon icon="mdi:play" /> Punch
                          </Button>
                        ) : (
                          <Button size="sm" variant="danger" disabled={isHolding} onClick={() => holdMembership(m._id)}>
                            <IconifyIcon icon="mdi:pause" /> Hold
                          </Button>
                        )
                      )
                      return (
                        <tr key={c._id}>
                          <td>
                            <div className="form-check">
                              <input type="checkbox" className="form-check-input" id={`cust_${c._id}`} />
                              <label className="form-check-label" htmlFor={`cust_${c._id}`} />
                            </div>
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>{c.name || '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>{c.email || '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>{c.phone || '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>{start}</td>
                          <td style={{ textWrap: 'nowrap' }}>{end}</td>
                          <td style={{ textWrap: 'nowrap' }}>{hasMembership ? pendingMeals : '-'}</td>
                          <td style={{ textWrap: 'nowrap' }}>
                            {hasMembership ? (
                              <span className={`badge ${isOnHold ? 'bg-danger' : 'bg-success'}`}>{isOnHold ? 'On Hold' : 'Active'}</span>
                            ) : (
                              <span className="badge bg-secondary">No Plan</span>
                            )}
                          </td>
                          <td style={{ textWrap: 'nowrap' }}>
                            <div className="d-flex gap-2">
                              {toggleBtn}
                              <Link href="/customer/customer-edit" className="btn btn-soft-primary btn-sm">
                                <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                              </Link>
                              <Link href="" className="btn btn-soft-danger btn-sm">
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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

export default CustomerDataList
