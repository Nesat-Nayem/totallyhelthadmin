import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  useCreateRoleMutation,
  useGetAllRolesQuery,
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  CreateRoleRequest,
  UpdateRoleRequest
} from '@/services/roleApi'
import Swal from 'sweetalert2'

export const useRoleApi = () => {
  const router = useRouter()

  // Mutations
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation()
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation()
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation()

  // Queries
  const getAllRoles = useGetAllRolesQuery
  const getRoleById = useGetRoleByIdQuery

  // Create role with success/error handling
  const createRoleWithFeedback = useCallback(async (data: CreateRoleRequest) => {
    try {
      const result = await createRole(data).unwrap()
      
      Swal.fire({
        title: 'Success!',
        text: result.message || 'Role created successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      })
      
      return result
    } catch (error: any) {
      // Extract error message from different possible error structures
      let errorMessage = 'Failed to create role'
      
      if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      })
      throw error
    }
  }, [createRole])

  // Update role with success/error handling
  const updateRoleWithFeedback = useCallback(async (id: string, data: UpdateRoleRequest) => {
    try {
      const result = await updateRole({ id, data }).unwrap()
      
      Swal.fire({
        title: 'Success!',
        text: result.message || 'Role updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      })
      
      return result
    } catch (error: any) {
      // Extract error message from different possible error structures
      let errorMessage = 'Failed to update role'
      
      if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      })
      throw error
    }
  }, [updateRole])

  // Delete role with confirmation and feedback
  const deleteRoleWithConfirmation = useCallback(async (id: string, roleName: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the role "${roleName}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteRole(id).unwrap()
        
        Swal.fire({
          title: 'Deleted!',
          text: deleteResult.message || 'Role has been deleted.',
          icon: 'success',
          confirmButtonText: 'OK'
        })
        
        return deleteResult
      } catch (error: any) {
        // Extract error message from different possible error structures
        let errorMessage = 'Failed to delete role'
        
        if (error?.data?.message) {
          errorMessage = error.data.message
        } else if (error?.message) {
          errorMessage = error.message
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (typeof error === 'string') {
          errorMessage = error
        }
        
        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        })
        throw error
      }
    }
  }, [deleteRole])

  return {
    // Mutations
    createRole: createRoleWithFeedback,
    updateRole: updateRoleWithFeedback,
    deleteRole: deleteRoleWithConfirmation,
    
    // Queries
    getAllRoles,
    getRoleById,
    
    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    
    // Direct mutations (without feedback)
    createRoleDirect: createRole,
    updateRoleDirect: updateRole,
    deleteRoleDirect: deleteRole,
  }
}

export default useRoleApi
