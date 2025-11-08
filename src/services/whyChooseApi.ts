import { baseApi } from '@/services/baseApi'

export type WhyChooseCard = {
  icon: string // Image URL
  title: string
  items: string[] // Array of bullet point items
}

export type WhyChoose = {
  _id?: string
  title: string
  subTitle: string
  card1: WhyChooseCard
  card2: WhyChooseCard
  card3: WhyChooseCard
  status: 'active' | 'inactive'
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type WhyChooseResponse = {
  success: boolean
  statusCode: number
  message: string
  data: WhyChoose | null
}

export type WhyChooseUpsertRequest = FormData

export const whyChooseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWhyChoose: builder.query<WhyChooseResponse, { status?: 'active' | 'inactive' } | void>({
      query: (params) => ({
        url: '/why-choose',
        method: 'GET',
        params: params || {},
      }),
      transformResponse: (response: WhyChooseResponse) => response,
      providesTags: [{ type: 'WhyChoose' as const, id: 'LIST' }],
    }),
    getWhyChooseById: builder.query<WhyChooseResponse, string>({
      query: (id) => ({
        url: `/why-choose/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: WhyChooseResponse) => response,
      providesTags: (result, error, id) => [{ type: 'WhyChoose' as const, id }],
    }),
    upsertWhyChoose: builder.mutation<WhyChooseResponse, WhyChooseUpsertRequest>({
      query: (formData) => ({
        url: '/why-choose',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: WhyChooseResponse) => response,
      invalidatesTags: [{ type: 'WhyChoose' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetWhyChooseQuery,
  useLazyGetWhyChooseQuery,
  useGetWhyChooseByIdQuery,
  useUpsertWhyChooseMutation,
} = whyChooseApi

