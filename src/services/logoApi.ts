import { baseApi } from '@/services/baseApi'

export type Logo = {
  _id: string
  image: string
  status: 'active' | 'inactive'
  order: number
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type LogoResponse = {
  success: boolean
  statusCode: number
  message: string
  data: Logo[]
}

export type SingleLogoResponse = {
  success: boolean
  statusCode: number
  message: string
  data: Logo
}

export type LogoCreateRequest = {
  file: File
  status?: 'active' | 'inactive'
  order?: number
}

export type LogoUpdateRequest = {
  file?: File
  status?: 'active' | 'inactive'
  order?: number
}

export const logoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllLogos: builder.query<LogoResponse, { status?: 'active' | 'inactive' } | void>({
      query: (params) => ({
        url: '/logos',
        method: 'GET',
        params: params || {},
      }),
      transformResponse: (response: LogoResponse) => response,
      providesTags: [{ type: 'Logo', id: 'LIST' }],
    }),
    getLogoById: builder.query<SingleLogoResponse, string>({
      query: (id) => ({
        url: `/logos/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: SingleLogoResponse) => response,
      providesTags: (result, error, id) => [{ type: 'Logo', id }],
    }),
    createLogo: builder.mutation<SingleLogoResponse, FormData>({
      query: (body) => ({
        url: '/logos',
        method: 'POST',
        body,
      }),
      transformResponse: (response: SingleLogoResponse) => response,
      invalidatesTags: [{ type: 'Logo', id: 'LIST' }],
    }),
    updateLogo: builder.mutation<SingleLogoResponse, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/logos/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: SingleLogoResponse) => response,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Logo', id },
        { type: 'Logo', id: 'LIST' },
      ],
    }),
    deleteLogo: builder.mutation<{ success: boolean; statusCode: number; message: string }, string>({
      query: (id) => ({
        url: `/logos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Logo', id },
        { type: 'Logo', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAllLogosQuery,
  useGetLogoByIdQuery,
  useCreateLogoMutation,
  useUpdateLogoMutation,
  useDeleteLogoMutation,
} = logoApi

