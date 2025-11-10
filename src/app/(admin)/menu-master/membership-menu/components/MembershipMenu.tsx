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
import { useGetMenusQuery, useDeleteMenuMutation } from '@/services/menuApi'
import { useGetBrandsQuery } from '@/services/brandApi'
import { useGetMenuCategoriesQuery } from '@/services/menuCategoryApi'
import { useGetBranchesQuery } from '@/services/branchApi'
import banner1 from '../../../../../assets/images/sample-menu/biryani.jpg'
import { toast } from 'react-toastify'

const MembershipMenu = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10
  
  // Get only membership menu items
  const { data: menusData, isLoading, isFetching } = useGetMenusQuery({ 
    q: searchQuery || undefined,
    priceType: 'membership',
    page, 
    limit 
  })
  const { data: brandsData } = useGetBrandsQuery()
  const { data: categoriesData } = useGetMenuCategoriesQuery()
  const { data: branchesData } = useGetBranchesQuery()
  const [deleteMenu] = useDeleteMenuMutation()
  
  const menus = menusData?.data ?? []
  const meta = menusData?.meta
  const brands = brandsData ?? []
  const categories = categoriesData ?? []
  const branches = branchesData ?? []
  
  const getBrandNames = (ids: string[] | undefined) => {
    if (!ids || !ids.length) return '-'
    return ids.map((id) => brands.find((b: any) => b._id === id)?.name || id).join(', ')
  }
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c: any) => c._id === categoryId)
    return category?.title || categoryId
  }
  const getBranchNames = (ids: string[] | undefined) => {
    if (!ids || !ids.length) return 'All'
    return ids.map((id) => branches.find((b: any) => b._id === id)?.name || id).join(', ')
  }
  
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        setDeletingId(id)
        await deleteMenu(id).unwrap()
        toast.success('Menu item deleted successfully')
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to delete menu item')
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
                    <th style={{ textWrap: 'nowrap' }}>Price Category</th>
                    <th style={{ textWrap: 'nowrap' }}>Brands</th>
                    <th style={{ textWrap: 'nowrap' }}>Branch</th>
                    <th style={{ textWrap: 'nowrap' }}>Description</th>
                    <th style={{ textWrap: 'nowrap' }}>Status</th>
                    <th style={{ textWrap: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(isLoading || isFetching) && (
                    <tr>
                      <td colSpan={11} className="text-center py-4">
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Loading menus...
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isFetching && menus.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center py-4">No menus found</td>
                    </tr>
                  )}
                  {!isLoading && !isFetching && menus.map((item: any) => (
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
                              <Image src={item.image} alt={item.title} className="avatar-md" width={60} height={60} style={{ objectFit: 'cover' }} unoptimized />
                            ) : (
                              <Image src={banner1} alt="product" className="avatar-md" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{item.title}</td>
                      <td>{getCategoryName(item.category)}</td>
                      <td>{item.membershipPrice ? `AED ${item.membershipPrice}` : '-'}</td>
                      <td>
                        <span className="badge bg-warning">Membership</span>
                      </td>
                      <td>{getBrandNames(item.brands)}</td>
                      <td>{getBranchNames(item.branches)}</td>
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

export default MembershipMenu
