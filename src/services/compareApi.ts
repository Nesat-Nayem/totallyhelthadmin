import { baseApi } from '@/services/baseApi'

export type CompareItem = {
  title: string
  included: boolean
}

export type Compare = {
  _id?: string
  title: string
  banner1: string // Image URL
  banner2: string // Image URL
  compareItems: CompareItem[]
  status: 'active' | 'inactive'
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
  // For frontend response (banner2 as image1, banner1 as image2)
  image1?: string
  image2?: string
}

export type CompareResponse = {
  success: boolean
  statusCode: number
  message: string
  data: Compare | null
}

export type CompareUpsertRequest = FormData

export const compareApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompare: builder.query<CompareResponse, { status?: 'active' | 'inactive' } | void>({
      query: (params) => ({
        url: '/compare',
        method: 'GET',
        params: params || {},
      }),
      transformResponse: (response: CompareResponse) => response,
    }),
    upsertCompare: builder.mutation<CompareResponse, CompareUpsertRequest>({
      query: (formData) => ({
        url: '/compare',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: CompareResponse) => response,
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetCompareQuery,
  useLazyGetCompareQuery,
  useUpsertCompareMutation,
} = compareApi

