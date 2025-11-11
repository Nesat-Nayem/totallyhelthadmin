import { baseApi } from '@/services/baseApi'

export type ApprovedBy = {
  _id: string
  name: string
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

export interface ApprovedByResponse {
  data: ApprovedBy[]
  message?: string
}

export interface ApprovedBySingleResponse {
  data: ApprovedBy
  message?: string
}

export const approvedByApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getApprovedBys: build.query<ApprovedByResponse, void>({
      query: () => ({ url: '/expenses/approved-bys', method: 'GET' }),
      transformResponse: (res: any) => res,
      providesTags: ['ApprovedBy'],
    }),
    getApprovedById: build.query<ApprovedBySingleResponse, string>({
      query: (id) => ({ url: `/expenses/approved-bys/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res,
      providesTags: (_r, _e, id) => [{ type: 'ApprovedBy' as const, id }],
    }),
    createApprovedBy: build.mutation<ApprovedBySingleResponse, { name: string; status?: 'active' | 'inactive' }>({
      query: (body) => ({ url: '/expenses/approved-bys', method: 'POST', body }),
      transformResponse: (res: any) => res,
      invalidatesTags: ['ApprovedBy'],
    }),
    updateApprovedBy: build.mutation<ApprovedBySingleResponse, { id: string; data: Partial<{ name: string; status: 'active' | 'inactive' }> }>({
      query: ({ id, data }) => ({ url: `/expenses/approved-bys/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: any) => res,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ApprovedBy', id }, 'ApprovedBy'],
    }),
    deleteApprovedBy: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/expenses/approved-bys/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ApprovedBy'],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetApprovedBysQuery,
  useLazyGetApprovedBysQuery,
  useGetApprovedByIdQuery,
  useCreateApprovedByMutation,
  useUpdateApprovedByMutation,
  useDeleteApprovedByMutation,
} = approvedByApi

