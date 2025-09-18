"use client"
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useGetAggregatorsQuery, useDeleteAggregatorMutation } from '@/services/aggregatorApi'
import { toast } from 'react-toastify'
import { confirmDelete } from '@/utils/sweetAlert'

const Aggregators: React.FC = () => {
  const { data: aggregators = [], isLoading, isFetching, isError, error } = useGetAggregatorsQuery()
  const [deleteAggregator] = useDeleteAggregatorMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete(
      'Delete Aggregator?', 
      'Are you sure you want to delete this aggregator? This action cannot be undone.'
    )
    if (!confirmed) return
    
    try {
      setDeletingId(id)
      await deleteAggregator(id).unwrap()
      toast.success('Aggregator deleted successfully')
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Failed to delete aggregator')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Aggregators List
            </CardTitle>
            <Link href="/aggregators/add-aggregators" className="btn btn-lg btn-primary">
              + Add Aggregators
            </Link>
          </CardHeader>
          {isError && (
            <div className="alert alert-danger mx-3 mt-3" role="alert">
              {(error as any)?.data?.message || (error as any)?.message || 'Failed to load aggregators'}
            </div>
          )}
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
                    <th>Aggregators Name</th>
                    <th>Logo</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(isLoading || isFetching) && (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Loading aggregators...
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isFetching && (!aggregators || aggregators.length === 0) && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No aggregators found
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isFetching && aggregators && aggregators.length > 0 && (
                    aggregators.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id={`agg_${item._id}`} />
                            <label className="form-check-label" htmlFor={`agg_${item._id}`} />
                          </div>
                        </td>

                        <td>{item.name}</td>
                        <td>
                          {item.logo ? (
                            <Image src={item.logo} alt={item.name} width={50} height={50} className="img-fluid rounded" unoptimized />
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          <span className={item.status === 'active' ? 'badge badge-soft-success' : 'badge badge-soft-danger'}>
                            {item.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/aggregators/aggregators-edit?id=${item._id}`} className="btn btn-soft-primary btn-sm">
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <button
                              type="button"
                              className="btn btn-soft-danger btn-sm"
                              onClick={() => handleDelete(item._id)}
                              disabled={deletingId === item._id}
                            >
                              {deletingId === item._id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                              ) : (
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              )}
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

export default Aggregators

