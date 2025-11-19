import { baseApi } from './baseApi'

export type GetInTouch = {
  _id: string
  title: string
  officeAddress: string
  contactNumbers: string[]
  emailAddresses: string[]
  careerInfo: string
  createdAt?: string
  updatedAt?: string
}

export type GetInTouchResponse = {
  success: boolean
  statusCode: number
  message: string
  data: GetInTouch | null
}

export type GetInTouchCreateOrUpdateRequest = {
  title: string
  officeAddress: string
  contactNumbers: string[]
  emailAddresses: string[]
  careerInfo: string
}

export const getInTouchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGetInTouch: builder.query<GetInTouchResponse | null, string | void>({
      async queryFn(id, _queryApi, _extraOptions, fetchWithBQ) {
        const url = id ? `/get-in-touch/${id}` : '/get-in-touch'
        const result = await fetchWithBQ({
          url,
          method: 'GET',
        })

        // Handle errors (including 404)
        if (result.error) {
          // Check for 404 status in all possible locations
          const error = result.error as any
          const status = 
            error?.status ||
            error?.originalStatus ||
            error?.data?.statusCode ||
            error?.data?.status ||
            (error?.data && typeof error.data === 'object' && 'statusCode' in error.data ? error.data.statusCode : null)
          
          // If it's a 404, return null data (not an error) - this prevents error state
          if (status === 404 || status === '404' || String(status) === '404') {
            // Return null data instead of error - RTK Query will treat this as success with null data
            return { data: null }
          }
          
          // Return other errors as-is
          return { error: result.error }
        }

        // Handle successful response - check if data is null (backend returns 200 with data: null)
        const response = result.data as GetInTouchResponse
        if (response && response.data === null) {
          // Backend returned 200 OK but with null data - return null to indicate no data exists
          return { data: null }
        }

        // Return the data
        return { data: response }
      },
      providesTags: [{ type: 'GetInTouch', id: 'SINGLE' }],
    }),
    upsertGetInTouch: builder.mutation<GetInTouchResponse, { id: string; data: GetInTouchCreateOrUpdateRequest }>({
      query: ({ id, data }) => ({
        url: `/get-in-touch/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: GetInTouchResponse) => response,
      invalidatesTags: [{ type: 'GetInTouch', id: 'SINGLE' }],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetGetInTouchQuery,
  useLazyGetGetInTouchQuery,
  useUpsertGetInTouchMutation,
} = getInTouchApi

