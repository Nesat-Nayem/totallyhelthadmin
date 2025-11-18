import { baseApi } from '@/services/baseApi'

export type FAQ = {
  _id: string
  question: string
  answer: string
  order: number
  isActive: boolean
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type FAQResponse = {
  success: boolean
  statusCode: number
  message: string
  data: FAQ[]
}

export type SingleFAQResponse = {
  success: boolean
  statusCode: number
  message: string
  data: FAQ
}

export type FAQCreateRequest = {
  question: string
  answer: string
  order?: number
  isActive?: boolean
}

export type FAQUpdateRequest = {
  question?: string
  answer?: string
  order?: number
  isActive?: boolean
}

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFAQs: builder.query<FAQResponse, { active?: boolean } | void>({
      query: (params) => ({
        url: '/faqs',
        method: 'GET',
        params: params ? { active: params.active ? 'true' : undefined } : {},
      }),
      transformResponse: (response: FAQResponse) => response,
      providesTags: [{ type: 'FAQ', id: 'LIST' }],
    }),
    createFAQ: builder.mutation<SingleFAQResponse, FAQCreateRequest>({
      query: (body) => ({
        url: '/faqs',
        method: 'POST',
        body,
      }),
      transformResponse: (response: SingleFAQResponse) => response,
      invalidatesTags: [{ type: 'FAQ', id: 'LIST' }],
    }),
    updateFAQ: builder.mutation<SingleFAQResponse, { id: string; data: FAQUpdateRequest }>({
      query: ({ id, data }) => ({
        url: `/faqs/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: SingleFAQResponse) => response,
      invalidatesTags: (result, error, { id }) => [
        { type: 'FAQ', id },
        { type: 'FAQ', id: 'LIST' },
      ],
    }),
    deleteFAQ: builder.mutation<SingleFAQResponse, string>({
      query: (id) => ({
        url: `/faqs/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: SingleFAQResponse) => response,
      invalidatesTags: (result, error, id) => [
        { type: 'FAQ', id },
        { type: 'FAQ', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAllFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
} = faqApi

