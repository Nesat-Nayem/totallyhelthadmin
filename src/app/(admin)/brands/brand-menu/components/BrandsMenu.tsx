'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
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
import { useGetMealPlansQuery, useDeleteMealPlanMutation } from '@/services/mealPlanApi'
import { useGetBrandsQuery } from '@/services/brandApi'
import { useGetCategoriesQuery } from '@/services/categoryApi'
import banner1 from '../../../../../assets/images/sample-menu/biryani.jpg'

const BrandsMenu = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10
  
  const { data: brandsData } = useGetBrandsQuery()
  const { data: categoriesData } = useGetCategoriesQuery()
  const { data: mealPlansData } = useGetMealPlansQuery({ 
    q: searchQuery || undefined,
    brand: selectedBrand || undefined,
    page, 
    limit 
  })
  const [deleteMealPlan] = useDeleteMealPlanMutation()
  
  const brands = brandsData ?? []
  const categories = categoriesData ?? []
  const mealPlans = mealPlansData?.data ?? []
  const meta = mealPlansData?.meta
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c: any) => c._id === categoryId)
    return category?.title || categoryId
  }
  
  const getBrandName = (brandId: string) => {
    const brand = brands.find((b: any) => b._id === brandId)
    return brand?.name || brandId
  }
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this meal plan?')) {
      try {
        await deleteMealPlan(id).unwrap()
        alert('Meal plan deleted successfully')
      } catch (error: any) {
        alert(error?.data?.message || 'Failed to delete meal plan')
      }
    }
  }
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
              <FormControl 
                placeholder="Search menu..." 
                type="search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            {/* Brand Filter Dropdown */}
            <select 
              style={{ maxWidth: '200px' }} 
              className="form-select form-select-sm p-1"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map((brand: any) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>

            <Link href="/menu-master/menu-add" className="btn btn-lg btn-primary">
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
                    <th style={{ textWrap: 'nowrap' }}>Brands</th>
                    <th style={{ textWrap: 'nowrap' }}>Branch</th>
                    <th style={{ textWrap: 'nowrap' }}>Description</th>
                    <th style={{ textWrap: 'nowrap' }}>Status</th>
                    <th style={{ textWrap: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mealPlans.map((item: any) => (
                    <tr key={item._id}>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id={`check-${item._id}`} />
                          <label className="form-check-label" htmlFor={`check-${item._id}`} />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                            {item.image ? (
                              <img src={item.image} alt={item.title || item.name} className="avatar-md" width={60} height={60} style={{ objectFit: 'cover' }} />
                            ) : (
                              <Image src={banner1} alt="product" className="avatar-md" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{item.title || item.name}</td>
                      <td>{getCategoryName(item.category)}</td>
                      <td>AED {item.price}</td>
                      <td>{getBrandName(item.brand)}</td>
                      <td>{item.branch || 'All'}</td>
                      <td>{item.description || '-'}</td>
                      <td>
                        <span className={`badge bg-${item.status === 'active' ? 'success' : 'danger'}`}>
                          {item.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/menu-master/menu-edit?id=${item._id}`} className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <Button 
                            variant="soft-danger" 
                            size="sm"
                            onClick={() => handleDelete(item._id)}
                          >
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

export default BrandsMenu
