import { baseApi } from './baseApi'
import { API_BASE_URL } from '@/utils/env'
import { MenuAccess } from '@/types/role'

// API Request/Response Types
export interface CreateRoleRequest {
  name: string
  email: string
  password: string
  phone: string
  role: 'super admin' | 'admin' | 'manager' | 'supervisor' | 'cashier' | 'waiter' | 'staff'
  menuAccess?: MenuAccess
}

export interface UpdateRoleRequest extends Partial<CreateRoleRequest> {
  status?: 'active' | 'inactive'
}

export interface Role {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  menuAccess: MenuAccess
  status: string
  createdAt: string
  updatedAt: string
}

export interface GetRolesResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    roles: Role[]
    total: number
    page: number
    limit: number
    totalPages: number
    availableRoles?: Array<{
      value: string
      label: string
    }>
  }
}

export interface GetRoleResponse {
  success: boolean
  statusCode: number
  message: string
  data: Role
}

export interface CreateRoleResponse {
  success: boolean
  statusCode: number
  message: string
  data: Role
}

export interface UpdateRoleResponse {
  success: boolean
  statusCode: number
  message: string
  data: Role
}

export interface DeleteRoleResponse {
  success: boolean
  statusCode: number
  message: string
}

// Role API endpoints
export const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Role
    createRole: builder.mutation<CreateRoleResponse, CreateRoleRequest>({
      query: (data) => ({
        url: '/auth/roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Role'],
    }),

    // Get All Roles
    getAllRoles: builder.query<GetRolesResponse, {
      page?: number
      limit?: number
      search?: string
      role?: string
      status?: string
    }>({
      query: (params = {}) => {
        console.log('roleApi - getAllRoles query params:', params)
        console.log('roleApi - Full URL will be:', `${API_BASE_URL}/auth/roles`)
        console.log('roleApi - API_BASE_URL:', API_BASE_URL)
        return {
          url: '/auth/roles',
          params,
        }
      },
      providesTags: ['Role'],
    }),

    // Get Role by ID
    getRoleById: builder.query<GetRoleResponse, string>({
      query: (id) => {
        console.log('API - getRoleById called with ID:', id)
        console.log('API - Full URL will be:', `${API_BASE_URL}/auth/roles/${id}`)
        return `/auth/roles/${id}`
      },
      providesTags: (result, error, id) => [{ type: 'Role', id }],
    }),

    // Update Role
    updateRole: builder.mutation<UpdateRoleResponse, { id: string; data: UpdateRoleRequest }>({
      query: ({ id, data }) => ({
        url: `/auth/roles/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Role', id }, 'Role'],
    }),

    // Delete Role
    deleteRole: builder.mutation<DeleteRoleResponse, string>({
      query: (id) => ({
        url: `/auth/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useCreateRoleMutation,
  useGetAllRolesQuery,
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi

// Export the API for direct usage if needed
export default roleApi
