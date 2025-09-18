'use client'
 import IconifyIcon from '@/components/wrappers/IconifyIcon'
 import Link from 'next/link'
 import React, { useEffect } from 'react'
 import { Card, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
 import { useGetPaymentMethodsQuery, useDeletePaymentMethodMutation } from '@/services/paymentMethodApi'
 import { toast } from 'react-toastify'

// Data will be fetched via RTK Query

const ListOfPaymentMethod: React.FC = () => {
  const { data: items = [], isLoading, isError, error } = useGetPaymentMethodsQuery()
  const [deletePaymentMethod, { isLoading: isDeleting }] = useDeletePaymentMethodMutation()

  useEffect(() => {
    if (isError) {
      const msg = (error as any)?.data?.message || (error as any)?.error || 'Failed to load payment methods'
      toast.error(msg)
    }
  }, [isError, error])

  const handleDelete = async (id: string) => {
    const yes = window.confirm('Are you sure you want to delete this payment method?')
    if (!yes) return
    try {
      await deletePaymentMethod(id).unwrap()
      toast.success('Payment method deleted')
    } catch (err) {
      const msg = (err as any)?.data?.message || (err as any)?.error || 'Failed to delete payment method'
      toast.error(msg)
    }
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Payment Method List
            </CardTitle>
            <Link href="/payment-method/add-new-payment-method" className="btn btn-lg btn-primary">
              + Add Payment Method
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
                  {isLoading && (
                    <tr>
                      <td colSpan={4}>Loading...</td>
                    </tr>
                  )}
                  {!isLoading && items.length === 0 && (
                    <tr>
                      <td colSpan={4}>No payment methods found</td>
                    </tr>
                  )}
                  {!isLoading &&
                    items.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id={`row-${item._id}`} />
                            <label className="form-check-label" htmlFor={`row-${item._id}`} />
                          </div>
                        </td>

                        <td>{item.name}</td>

                        <td>
                          <span className={item.status === 'active' ? 'badge badge-soft-success' : 'badge badge-soft-danger'}>
                            {item.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link
                              href={`/payment-method/edit-new-payment-method?id=${item._id}`}
                              className="btn btn-soft-primary btn-sm"
                            >
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <button
                              type="button"
                              className="btn btn-soft-danger btn-sm"
                              disabled={isDeleting}
                              onClick={() => handleDelete(item._id)}
                            >
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                            </button>
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

export default ListOfPaymentMethod
