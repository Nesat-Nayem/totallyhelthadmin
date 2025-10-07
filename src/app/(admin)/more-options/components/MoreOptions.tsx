'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import {
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
import { useGetMoreOptionsQuery, useDeleteMoreOptionMutation } from '@/services/moreOptionApi'
import { toast } from 'react-toastify'
import { confirmDelete } from '@/utils/sweetAlert'

const MoreOptions: React.FC = () => {
  const { data: moreOptions = [], isLoading, isFetching, isError, error } = useGetMoreOptionsQuery()
  const [deleteMoreOption] = useDeleteMoreOptionMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Filter options based on selected category
  const filteredOptions = selectedCategory === 'all' 
    ? moreOptions 
    : moreOptions.filter(option => option.category === selectedCategory)

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete(
      'Delete More Option?', 
      'Are you sure you want to delete this more option? This action cannot be undone.'
    )
    if (!confirmed) return
    
    try {
      setDeletingId(id)
      await deleteMoreOption(id).unwrap()
      toast.success('More option deleted successfully')
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Failed to delete more option')
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
              More Options List
            </CardTitle>

            {/* Category Filter */}
            <div style={{ minWidth: '150px' }}>
              <select 
                className="form-select" 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="more">More Options</option>
                <option value="less">Less Options</option>
                <option value="without">Without Options</option>
                <option value="general">General Options</option>
              </select>
            </div>

            {/* Search Input */}
            <InputGroup style={{ maxWidth: '250px' }}>
              <FormControl placeholder="Search..." />
            </InputGroup>
            <Link href="/more-options/more-options-add" className="btn btn-lg btn-primary">
              + Add Options
            </Link>
          </CardHeader>
          {isError && (
            <div className="alert alert-danger mx-3 mt-3" role="alert">
              {(error as any)?.data?.message || (error as any)?.message || 'Failed to load more options'}
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
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(isLoading || isFetching) && (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Loading more options...
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isFetching && (!filteredOptions || filteredOptions.length === 0) && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        {selectedCategory === 'all' ? 'No more options found' : `No ${selectedCategory} options found`}
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isFetching && filteredOptions && filteredOptions.length > 0 && (
                    filteredOptions.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id={`opt_${item._id}`} />
                            <label className="form-check-label" htmlFor={`opt_${item._id}`} />
                          </div>
                        </td>

                        <td>
                          <div className="fw-medium">{item.name}</div>
                        </td>
                        <td>
                          <span className={`badge ${
                            item.category === 'more' ? 'badge-soft-success' :
                            item.category === 'less' ? 'badge-soft-warning' :
                            item.category === 'without' ? 'badge-soft-danger' :
                            'badge-soft-info'
                          }`}>
                            {item.category === 'more' ? 'More' :
                             item.category === 'less' ? 'Less' :
                             item.category === 'without' ? 'Without' :
                             'General'}
                          </span>
                        </td>

                        <td>
                          <span className={item.status === 'active' ? 'badge badge-soft-success' : 'badge badge-soft-danger'}>
                            {item.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/more-options/more-options-edit?id=${item._id}`} className="btn btn-soft-primary btn-sm">
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

export default MoreOptions
