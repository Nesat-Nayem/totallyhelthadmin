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
import { useGetExpenseTypesQuery, useDeleteExpenseTypeMutation } from '@/services/expenseTypeApi'
import Swal from 'sweetalert2'
import { showSuccess, showError } from '@/utils/sweetAlert'

const ExpenseTypeList = () => {
  const [query, setQuery] = useState('')
  const { data: expenseTypesRes, isLoading, refetch } = useGetExpenseTypesQuery()
  const [deleteExpenseType] = useDeleteExpenseTypeMutation()

  const expenseTypes = useMemo(() => expenseTypesRes?.data || [], [expenseTypesRes])

  const filteredExpenseTypes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return expenseTypes
    return expenseTypes.filter((et: any) =>
      et.name?.toLowerCase().includes(q)
    )
  }, [expenseTypes, query])

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
        await deleteExpenseType(id).unwrap()
        showSuccess('Expense type has been deleted.')
        refetch()
      } catch (error: any) {
        showError(error?.data?.message || 'Failed to delete expense type.')
      }
    }
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <CardTitle as="h4" className="mb-0 flex-grow-1">
              Expense Types
            </CardTitle>

            <InputGroup style={{ maxWidth: '250px' }}>
              <FormControl placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <Button variant="outline-secondary">
                <IconifyIcon icon="mdi:magnify" />
              </Button>
            </InputGroup>

            <Link href="/expenses/expense-types/add" className="btn btn-lg btn-primary">
              + Add Expense Type
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
                  {!isLoading && filteredExpenseTypes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-4">No expense types found</td>
                    </tr>
                  )}
                  {!isLoading && filteredExpenseTypes.map((et: any) => (
                    <tr key={et._id}>
                      <td>{et.name}</td>
                      <td>
                        <span className={`badge ${et.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                          {et.status}
                        </span>
                      </td>
                      <td>{et.createdAt ? new Date(et.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/expenses/expense-types/edit/${et._id}`} className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <Button
                            variant="soft-danger"
                            size="sm"
                            onClick={() => handleDelete(et._id, et.name)}
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

export default ExpenseTypeList

