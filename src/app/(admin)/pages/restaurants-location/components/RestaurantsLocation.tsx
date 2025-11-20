'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button, Card, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useDeleteRestaurantLocationMutation, useGetRestaurantLocationsQuery } from '@/services/restaurantLocationApi'
import type { RestaurantLocation } from '@/services/restaurantLocationApi'

const RestaurantsLocation = () => {
  const { data = [], isLoading } = useGetRestaurantLocationsQuery()
  const [deleteRestaurantLocation, { isLoading: deleting }] = useDeleteRestaurantLocationMutation()

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this restaurant location?')) {
      try {
        await deleteRestaurantLocation(id).unwrap()
      } catch (e: any) {
        alert(e?.data?.message || 'Failed to delete restaurant location')
      }
    }
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Restaurants Locations
            </CardTitle>
            <Link href="/pages/restaurants-location/restaurants-location-add" className="btn btn-lg btn-primary">
              + Add Restaurant Location
            </Link>
          </CardHeader>
          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Restaurant Image</th>
                    <th>Restaurant Name</th>
                    <th>Address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4}>Loading...</td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No restaurant locations found</td>
                    </tr>
                  ) : (
                    data.map((item: RestaurantLocation) => (
                      <tr key={item._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={50}
                                  height={50}
                                  className="avatar-md rounded"
                                  style={{ objectFit: 'cover' }}
                                />
                              ) : (
                                <IconifyIcon icon="solar:restaurant-bold-duotone" className="fs-24 text-muted" />
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{item.name}</td>
                        <td>{item.address}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link
                              href={`/pages/restaurants-location/restaurants-location-edit?id=${item._id}`}
                              className="btn btn-soft-primary btn-sm"
                            >
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <Button
                              variant="soft-danger"
                              size="sm"
                              onClick={() => handleDelete(item._id)}
                              disabled={deleting}
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
                <li className="page-item active">
                  <Link className="page-link" href="">
                    1
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

export default RestaurantsLocation
