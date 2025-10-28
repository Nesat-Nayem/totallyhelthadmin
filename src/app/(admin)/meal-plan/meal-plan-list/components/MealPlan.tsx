'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import {
  Button,
  Card,
  CardBody,
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
import { useGetMealPlansQuery, useDeleteMealPlanMutation } from '@/services/mealPlanApi'
import { showSuccess, showError } from '@/utils/sweetAlert'
import Swal from 'sweetalert2'

const MealPlan = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)

  const { data: mealPlansData, isLoading, error, refetch } = useGetMealPlansQuery({
    q: searchTerm,
    page: currentPage,
    limit: limit
  })

  // Force refetch when component mounts (after redirect from create)
  React.useEffect(() => {
    refetch()
  }, [refetch])

  const [deleteMealPlan] = useDeleteMealPlanMutation()

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    })
    
    if (result.isConfirmed) {
      try {
        await deleteMealPlan(id).unwrap()
        showSuccess('Meal plan has been deleted.')
        refetch()
      } catch (error) {
        showError('Failed to delete meal plan.')
      }
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  if (error) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <p className="text-danger">Error loading meal plans. Please try again.</p>
              <Button variant="primary" onClick={() => refetch()}>
                Retry
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  const mealPlans = mealPlansData?.data || []
  const totalPages = Math.ceil((mealPlansData?.meta?.total || 0) / limit)
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
              <FormControl 
                placeholder="Search..." 
                value={searchTerm}
                onChange={handleSearch}
              />
              <Button variant="outline-secondary">
                <IconifyIcon icon="mdi:magnify" />
              </Button>
            </InputGroup>

            {/* Month Filter Dropdown */}
            <Link href="/meal-plan/add-meal-plan" className="btn btn-lg btn-primary">
              + Add Meal
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
                  {mealPlans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        <p className="text-muted">No meal plans found</p>
                      </td>
                    </tr>
                  ) : (
                    mealPlans.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id={`customCheck-${item._id}`} />
                            <label className="form-check-label" htmlFor={`customCheck-${item._id}`} />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                        <Image 
                          src={item.thumbnail || (item.images && item.images[0]) || '/placeholder-image.jpg'} 
                          alt={item.title} 
                          className="avatar-md"
                          width={40}
                          height={40}
                        />
                            </div>
                          </div>
                        </td>
                        <td>{item.title}</td>
                        <td>{item.category || 'N/A'}</td>
                        <td>{item.brand || 'N/A'}</td>
                        <td>AED {item.price}</td>
                        <td>
                          <span className={`badge ${item.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                            {item.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/meal-plan/meal-plan-view/${item._id}`} className="btn btn-light btn-sm">
                              <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                            </Link>
                            <Link href={`/meal-plan/meal-plan-edit/${item._id}`} className="btn btn-soft-primary btn-sm">
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDelete(item._id, item.title)}
                            >
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                            </Button>
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
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <Button 
                    variant="link" 
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <Button 
                      variant="link" 
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <Button 
                    variant="link" 
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
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
