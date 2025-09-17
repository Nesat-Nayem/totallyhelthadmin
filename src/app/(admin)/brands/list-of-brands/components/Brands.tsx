'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button, Card, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useGetBrandsQuery, useDeleteBrandMutation } from '@/services/brandApi'
import banner1 from '@/assets/images/brands/dhl.png'

const Brands = () => {
  const [page, setPage] = useState(1)
  const limit = 10
  
  const { data: brandsData } = useGetBrandsQuery()
  const [deleteBrand] = useDeleteBrandMutation()
  
  const brands = brandsData ?? []
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await deleteBrand(id).unwrap()
        alert('Brand deleted successfully')
      } catch (error: any) {
        alert(error?.data?.message || 'Failed to delete brand')
      }
    }
  }
  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Brands List
            </CardTitle>
            <Link href="/brands/brands-add" className="btn btn-lg btn-primary">
              + Add Brands
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
                    <th>Brand Name</th>
                    <th>Logo</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((item: any) => (
                    <tr key={item._id}>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id={`check-${item._id}`} />
                          <label className="form-check-label" htmlFor={`check-${item._id}`} />
                        </div>
                      </td>

                      <td>{item.name}</td>

                      <td>
                        <Image 
                          src={item.logo || banner1} 
                          alt={item.name || 'Brand'} 
                          width={50} 
                          height={50} 
                          className="rounded" 
                          unoptimized={!!item.logo}
                        />
                      </td>

                      <td>
                        <span className={item.status === 'active' ? 'badge badge-soft-success' : 'badge badge-soft-danger'}>
                          {item.status || 'active'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/brands/brands-edit?id=${item._id}`} className="btn btn-soft-primary btn-sm">
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

export default Brands
