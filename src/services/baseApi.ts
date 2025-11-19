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
    
    // Don't set content-type in prepareHeaders
    // We'll handle it in fetchFn based on the actual request body and method
    
    return headers
  },
  fetchFn: async (input, init) => {
    if (!init) {
      return fetch(input)
    }
    
    // Custom fetch to handle FormData and preserve headers properly
    const headers = new Headers(init.headers)
    
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
    
    // Handle content-type based on body type and method
    const method = (init.method || 'GET').toUpperCase()
    const body = init.body
    
    // CRITICAL FIX: Always set Content-Type for POST, PUT, PATCH, DELETE with body
    if (body instanceof FormData) {
      // Remove content-type for FormData - browser will set it with boundary automatically
      headers.delete('content-type')
    } else if (method === 'GET' || !body || body === '') {
      // Remove content-type for GET requests or requests without body
      headers.delete('content-type')
    } else {
      // FORCE Content-Type to application/json for all JSON requests
      // This MUST be set for backend to parse the body correctly
      headers.set('content-type', 'application/json')
    }
    
    // Debug log to verify Content-Type is set
    if (method !== 'GET' && body && !(body instanceof FormData)) {
      console.log('[baseApi] Setting Content-Type for', method, 'request:', headers.get('content-type'))
    }
    
    // Create new request init with proper headers
    const requestInit: RequestInit = {
      ...init,
      headers: headers,
    }
    
    return fetch(input, requestInit)
  },
})

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Branch', 'MealPlan', 'Category', 'Brand', 'Aggregator', 'PaymentMethod', 'MoreOption', 'Customer', 'Order', 'Menu', 'MenuCategory', 'DayClose', 'Shift', 'Role', 'UserMembership', 'Banner', 'IncludedMeal', 'Testimonial', 'WhyChoose', 'MealPlanWork', 'Compare', 'ExpenseType', 'Supplier', 'ApprovedBy', 'Expense', 'Video', 'Logo', 'Subscription', 'AboutUsDetails', 'AboutUsFood', 'AboutUsAuthor', 'FAQ', 'TermsCondition', 'PrivacyPolicy', 'Contact', 'GetInTouch'],
  endpoints: () => ({}),
})
