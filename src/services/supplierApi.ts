import { baseApi } from '@/services/baseApi'

export type Supplier = {
  _id: string
  name: string
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

export interface SupplierResponse {
  data: Supplier[]
  message?: string
}

export interface SupplierSingleResponse {
  data: Supplier
  message?: string
}

export const supplierApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSuppliers: build.query<SupplierResponse, void>({
      query: () => ({ url: '/expenses/suppliers', method: 'GET' }),
      transformResponse: (res: any) => res,
      providesTags: ['Supplier'],
    }),
    getSupplierById: build.query<SupplierSingleResponse, string>({
      query: (id) => ({ url: `/expenses/suppliers/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res,
      providesTags: (_r, _e, id) => [{ type: 'Supplier' as const, id }],
    }),
    createSupplier: build.mutation<SupplierSingleResponse, { name: string; status?: 'active' | 'inactive' }>({
      query: (body) => ({ url: '/expenses/suppliers', method: 'POST', body }),
      transformResponse: (res: any) => res,
      invalidatesTags: ['Supplier'],
    }),
    updateSupplier: build.mutation<SupplierSingleResponse, { id: string; data: Partial<{ name: string; status: 'active' | 'inactive' }> }>({
      query: ({ id, data }) => ({ url: `/expenses/suppliers/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: any) => res,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Supplier', id }, 'Supplier'],
    }),
    deleteSupplier: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/expenses/suppliers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Supplier'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetSuppliersQuery,
  useLazyGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi

