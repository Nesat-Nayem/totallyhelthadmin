import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '@/utils/env'
import { getAuthToken } from '@/utils/auth'

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { endpoint, extra, forced }) => {
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
    
    // Don't set content-type here - we'll handle it in fetchFn
    // For FormData, browser needs to set multipart/form-data with boundary
    // For JSON, we'll set application/json in fetchFn
    
    return headers
  },
  fetchFn: async (input, init) => {
    // Custom fetch to handle FormData and preserve headers properly
    const headers = new Headers(init?.headers)
    
    // Ensure authorization token is set
    if (typeof window !== 'undefined') {
      try {
        const token = getAuthToken()
        if (token && !headers.has('authorization')) {
          headers.set('authorization', `Bearer ${token}`)
        }
      } catch (error) {
        console.error('Error getting auth token in fetchFn:', error)
      }
    }
    
    // Handle content-type based on body type
    if (init?.body instanceof FormData) {
      // Remove content-type for FormData - browser will set it with boundary automatically
      headers.delete('content-type')
    } else if (init?.body && !headers.has('content-type')) {
      // Set content-type for non-FormData requests
      headers.set('content-type', 'application/json')
    }
    
    return fetch(input, {
      ...init,
      headers,
    })
  },
})

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Branch', 'MealPlan', 'Category', 'Brand', 'Aggregator', 'PaymentMethod', 'MoreOption', 'Customer', 'Order', 'Menu', 'MenuCategory', 'DayClose', 'Shift', 'Role', 'UserMembership', 'Banner'],
  endpoints: () => ({}),
})
