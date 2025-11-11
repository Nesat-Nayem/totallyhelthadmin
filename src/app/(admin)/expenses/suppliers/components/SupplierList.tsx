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
import { useGetSuppliersQuery, useDeleteSupplierMutation } from '@/services/supplierApi'
import Swal from 'sweetalert2'
import { showSuccess, showError } from '@/utils/sweetAlert'

const SupplierList = () => {
  const [query, setQuery] = useState('')
  const { data: suppliersRes, isLoading, refetch } = useGetSuppliersQuery()
  const [deleteSupplier] = useDeleteSupplierMutation()

  const suppliers = useMemo(() => suppliersRes?.data || [], [suppliersRes])

  const filteredSuppliers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return suppliers
    return suppliers.filter((s: any) =>
      s.name?.toLowerCase().includes(q)
    )
  }, [suppliers, query])

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
        await deleteSupplier(id).unwrap()
        showSuccess('Supplier has been deleted.')
        refetch()
      } catch (error: any) {
        showError(error?.data?.message || 'Failed to delete supplier.')
      }
    }
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <CardTitle as="h4" className="mb-0 flex-grow-1">
              Suppliers
            </CardTitle>

            <InputGroup style={{ maxWidth: '250px' }}>
              <FormControl placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <Button variant="outline-secondary">
                <IconifyIcon icon="mdi:magnify" />
              </Button>
            </InputGroup>

            <Link href="/expenses/suppliers/add" className="btn btn-lg btn-primary">
              + Add Supplier
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
                  {!isLoading && filteredSuppliers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-4">No suppliers found</td>
                    </tr>
                  )}
                  {!isLoading && filteredSuppliers.map((s: any) => (
                    <tr key={s._id}>
                      <td>{s.name}</td>
                      <td>
                        <span className={`badge ${s.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/expenses/suppliers/edit/${s._id}`} className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <Button
                            variant="soft-danger"
                            size="sm"
                            onClick={() => handleDelete(s._id, s.name)}
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

export default SupplierList

