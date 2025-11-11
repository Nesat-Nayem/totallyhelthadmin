import { baseApi } from '@/services/baseApi'

export type Testimonial = {
  _id: string
  quote: string
  authorName: string
  authorProfession: string
  order: number
  status: 'active' | 'inactive'
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type TestimonialResponse = {
  success: boolean
  statusCode: number
  message: string
  data: Testimonial[]
}

export type SingleTestimonialResponse = {
  success: boolean
  statusCode: number
  message: string
  data: Testimonial
}

export type TestimonialCreateRequest = {
  quote: string
  authorName: string
  authorProfession: string
  order?: number
  status?: 'active' | 'inactive'
}

export type TestimonialUpdateRequest = {
  quote?: string
  authorName?: string
  authorProfession?: string
  order?: number
  status?: 'active' | 'inactive'
}

export const testimonialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTestimonials: builder.query<TestimonialResponse, { status?: 'active' | 'inactive' } | void>({
      query: (params) => ({
        url: '/testimonials',
        method: 'GET',
        params: params || {},
      }),
      transformResponse: (response: TestimonialResponse) => response,
      providesTags: [{ type: 'Testimonial', id: 'LIST' }],
    }),
    getTestimonialById: builder.query<SingleTestimonialResponse, string>({
      query: (id) => ({
        url: `/testimonials/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: SingleTestimonialResponse) => response,
      providesTags: (result, error, id) => [{ type: 'Testimonial', id }],
    }),
    createTestimonial: builder.mutation<SingleTestimonialResponse, TestimonialCreateRequest>({
      query: (body) => ({
        url: '/testimonials',
        method: 'POST',
        body,
      }),
      transformResponse: (response: SingleTestimonialResponse) => response,
      invalidatesTags: [{ type: 'Testimonial', id: 'LIST' }],
    }),
    updateTestimonial: builder.mutation<SingleTestimonialResponse, { id: string; data: TestimonialUpdateRequest }>({
      query: ({ id, data }) => ({
        url: `/testimonials/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: SingleTestimonialResponse) => response,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Testimonial', id },
        { type: 'Testimonial', id: 'LIST' },
      ],
    }),
    deleteTestimonial: builder.mutation<{ success: boolean; statusCode: number; message: string }, string>({
      query: (id) => ({
        url: `/testimonials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Testimonial', id },
        { type: 'Testimonial', id: 'LIST' },
      ],
    }),
    getActiveTestimonials: builder.query<TestimonialResponse, void>({
      query: () => ({
        url: '/testimonials/public/active',
        method: 'GET',
      }),
      transformResponse: (response: TestimonialResponse) => response,
      providesTags: [{ type: 'Testimonial', id: 'ACTIVE' }],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAllTestimonialsQuery,
  useGetTestimonialByIdQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
  useGetActiveTestimonialsQuery,
} = testimonialApi

