import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '@/utils/env'

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('backend_token')
        if (token) headers.set('authorization', `Bearer ${token}`)
      }
    } catch {}
    headers.set('content-type', 'application/json')
    return headers
  },
})

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Branch'],
  endpoints: () => ({}),
})
