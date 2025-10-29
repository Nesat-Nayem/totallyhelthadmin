import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '@/utils/env'
import { getAuthToken } from '@/utils/auth'

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { endpoint }) => {
    try {
      if (typeof window !== 'undefined') {
        const token = getAuthToken()
        if (token) {
          headers.set('authorization', `Bearer ${token}`)
        }
      }
    } catch (error) {
      console.error('Error preparing headers:', error)
    }
    
    // Only set content-type for non-FormData requests
    // FormData needs browser to set boundary automatically
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json')
    }
    
    return headers
  },
})

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Branch', 'MealPlan', 'Category', 'Brand', 'Aggregator', 'PaymentMethod', 'MoreOption', 'Customer', 'Order', 'Menu', 'MenuCategory', 'DayClose', 'Shift', 'Role', 'UserMembership'],
  endpoints: () => ({}),
})
