"use client"
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import { Button, Card, CardFooter, CardHeader, CardTitle, Col, FormControl, InputGroup, Row } from 'react-bootstrap'
import { useDeleteBranchMutation, useGetBranchesQuery } from '@/services/branchApi'
import type { Branch } from '@/services/branchApi'

const Branches: React.FC = () => {
  const { data = [], isLoading } = useGetBranchesQuery()
  const [deleteBranch, { isLoading: deleting }] = useDeleteBranchMutation()

  const handleDelete = async (id: string) => {
    if (confirm('Delete this branch?')) {
      try {
        await deleteBranch(id).unwrap()
      } catch (e) {
        // noop; could add toast
      }
    }
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Branch List
            </CardTitle>
            <InputGroup style={{ maxWidth: '250px' }}>
              <FormControl placeholder="Search..." />
            </InputGroup>
            <Link href="/branches/add-new-branch" className="btn btn-lg btn-primary">
              + Add Branch
            </Link>
          </CardHeader>
          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Branch Name</th>
                    <th>Branch Location</th>
                    <th>Brand</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5}>Loading...</td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={5}>No branches</td>
                    </tr>
                  ) : (
                    data.map((item: Branch) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.location || '-'}</td>
                        <td>{item.brand || '-'}</td>
                        <td>
                          <span className={item.status === 'active' ? 'badge badge-soft-success' : 'badge badge-soft-danger'}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/branches/edit-new-branch?id=${item._id}`} className="btn btn-soft-primary btn-sm">
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <Button variant="soft-danger" size="sm" onClick={() => handleDelete(item._id)} disabled={deleting}>
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

export default Branches
