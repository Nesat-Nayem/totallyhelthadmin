'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Col,
  FormControl,
  InputGroup,
  Row,
} from 'react-bootstrap'
import { useGetApprovedBysQuery, useDeleteApprovedByMutation } from '@/services/approvedByApi'
import Swal from 'sweetalert2'
import { showSuccess, showError } from '@/utils/sweetAlert'

const ApprovedByList = () => {
  const [query, setQuery] = useState('')
  const { data: approvedBysRes, isLoading, refetch } = useGetApprovedBysQuery()
  const [deleteApprovedBy] = useDeleteApprovedByMutation()

  const approvedBys = useMemo(() => approvedBysRes?.data || [], [approvedBysRes])

  const filteredApprovedBys = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return approvedBys
    return approvedBys.filter((ab: any) =>
      ab.name?.toLowerCase().includes(q)
    )
  }, [approvedBys, query])

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    })
    
    if (result.isConfirmed) {
      try {
        await deleteApprovedBy(id).unwrap()
        showSuccess('Approved by has been deleted.')
        refetch()
      } catch (error: any) {
        showError(error?.data?.message || 'Failed to delete approved by.')
      }
    }
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <CardTitle as="h4" className="mb-0 flex-grow-1">
              Approved By
            </CardTitle>

            <InputGroup style={{ maxWidth: '250px' }}>
              <FormControl placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <Button variant="outline-secondary">
                <IconifyIcon icon="mdi:magnify" />
              </Button>
            </InputGroup>

            <Link href="/expenses/approved-bys/add" className="btn btn-lg btn-primary">
              + Add Approved By
            </Link>
          </CardHeader>

          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={4} className="text-center py-4">Loading...</td>
                    </tr>
                  )}
                  {!isLoading && filteredApprovedBys.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-4">No approved by found</td>
                    </tr>
                  )}
                  {!isLoading && filteredApprovedBys.map((ab: any) => (
                    <tr key={ab._id}>
                      <td>{ab.name}</td>
                      <td>
                        <span className={`badge ${ab.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                          {ab.status}
                        </span>
                      </td>
                      <td>{ab.createdAt ? new Date(ab.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/expenses/approved-bys/edit/${ab._id}`} className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <Button
                            variant="soft-danger"
                            size="sm"
                            onClick={() => handleDelete(ab._id, ab.name)}
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
        </Card>
      </Col>
    </Row>
  )
}

export default ApprovedByList

