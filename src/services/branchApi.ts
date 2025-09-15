import { baseApi } from './baseApi'

export type Branch = {
  _id: string
  name: string
  location?: string
  brand?: string
  logo?: string
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

export type CreateBranchDto = Omit<Branch, '_id' | 'createdAt' | 'updatedAt'>
export type UpdateBranchDto = Partial<CreateBranchDto>

export const branchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBranches: build.query<Branch[], void>({
      query: () => ({ url: '/branches', method: 'GET' }),
      transformResponse: (res: any) => res?.data ?? [],
      providesTags: (result) =>
        result ? [...result.map(({ _id }) => ({ type: 'Branch' as const, id: _id })), { type: 'Branch' as const, id: 'LIST' }] : [{ type: 'Branch', id: 'LIST' }],
    }),
    getBranchById: build.query<Branch, string>({
      query: (id) => ({ url: `/branches/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res?.data,
      providesTags: (_res, _err, id) => [{ type: 'Branch', id }],
    }),
    createBranch: build.mutation<Branch, CreateBranchDto>({
      query: (body) => ({ url: '/branches', method: 'POST', body }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'Branch', id: 'LIST' }],
    }),
    updateBranch: build.mutation<Branch, { id: string; data: UpdateBranchDto }>({
      query: ({ id, data }) => ({ url: `/branches/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Branch', id }, { type: 'Branch', id: 'LIST' }],
    }),
    deleteBranch: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/branches/${id}`, method: 'DELETE' }),
      transformResponse: (res: any) => ({ success: !!res?.success }),
      invalidatesTags: (_res, _err, id) => [{ type: 'Branch', id }, { type: 'Branch', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetBranchesQuery,
  useGetBranchByIdQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchApi
