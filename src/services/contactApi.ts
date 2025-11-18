import { baseApi } from '@/services/baseApi'

export type Contact = {
  _id: string
  fullName: string
  emailAddress: string
  phoneNumber?: string
  subject?: string
  message: string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type ContactResponse = {
  success: boolean
  statusCode: number
  message: string
  data: Contact[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}

export type SingleContactResponse = {
  success: boolean
  statusCode: number
  message: string
  data: Contact
}

export type ContactCreateRequest = {
  fullName: string
  emailAddress: string
  phoneNumber?: string
  subject?: string
  message: string
}

export type ContactQueryParams = {
  page?: number
  limit?: number
  search?: string
  startDate?: string
  endDate?: string
}

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllContacts: builder.query<ContactResponse, ContactQueryParams | void>({
      query: (params) => ({
        url: '/contact',
        method: 'GET',
        params: params || {},
      }),
      transformResponse: (response: ContactResponse) => response,
      providesTags: [{ type: 'Contact', id: 'LIST' }],
    }),
    getContactById: builder.query<SingleContactResponse, string>({
      query: (id) => ({
        url: `/contact/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: SingleContactResponse) => response,
      providesTags: (result, error, id) => [{ type: 'Contact', id }],
    }),
    deleteContactById: builder.mutation<SingleContactResponse, string>({
      query: (id) => ({
        url: `/contact/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Contact', id },
        { type: 'Contact', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAllContactsQuery,
  useGetContactByIdQuery,
  useDeleteContactByIdMutation,
} = contactApi

