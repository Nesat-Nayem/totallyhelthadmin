import { baseApi } from './baseApi'

export interface Shift {
  _id: string
  shiftNumber: number
  startDate: string
  startTime: string
  endDate?: string
  endTime?: string
  logoutTime?: string
  branchId?: string
  createdBy?: string
  closedBy?: string
  status: 'open' | 'closed' | 'day-close'
  loginName: string
  note?: string
  denominations: {
    denomination1000: number
    denomination500: number
    denomination200: number
    denomination100: number
    denomination50: number
    denomination20: number
    denomination10: number
    denomination5: number
    denomination2: number
    denomination1: number
    totalCash: number
  }
  createdAt: string
  updatedAt: string
}

export interface ShiftStartRequest {
  shiftNumber?: number
  loginDate?: string
  loginTime?: string
  logoutDate?: string
  logoutTime?: string
  loginName?: string
  note?: string
}

export interface ShiftCloseRequest {
  denominations: {
    denomination1000: number
    denomination500: number
    denomination200: number
    denomination100: number
    denomination50: number
    denomination20: number
    denomination10: number
    denomination5: number
    denomination2: number
    denomination1: number
  }
}

export interface DayCloseRequest {
  note?: string
  denominations?: {
    denomination1000?: number
    denomination500?: number
    denomination200?: number
    denomination100?: number
    denomination50?: number
    denomination20?: number
    denomination10?: number
    denomination5?: number
    denomination2?: number
    denomination1?: number
  }
}

export interface ShiftQueryParams {
  page?: number
  limit?: number
  date?: string
  status?: 'open' | 'closed' | 'day-close'
  shiftNumber?: number
}

export interface ShiftResponse {
  message: string
  data: Shift
  warning?: string
}

export interface ShiftsResponse {
  data: Shift[]
  meta: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface DayCloseResponse {
  message: string
  data: Shift[]
  closedCount: number
  dayCloseTime: string
  closedBy: string
  thermalReport?: string
  daySales?: any
  shiftWiseTotals?: any
  summary?: {
    dayWise: {
      totalOrders: number
      totalSales: number
      description: string
    }
    shiftWise: {
      totalOrders: number
      totalSales: number
      description: string
    }
  }
}

export const shiftApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get current open shift
    getCurrentShift: builder.query<{ data: Shift | null }, void>({
      query: () => ({
        url: '/shift/current',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }),
      providesTags: ['Shift'],
    }),

    // Start a new shift
    startShift: builder.mutation<ShiftResponse, ShiftStartRequest>({
      query: (body) => ({
        url: '/shift/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shift'],
    }),

    // Close current shift
    closeShift: builder.mutation<ShiftResponse, ShiftCloseRequest>({
      query: (body) => ({
        url: '/shift/close',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shift'],
    }),

    // Perform day close
    dayClose: builder.mutation<DayCloseResponse, DayCloseRequest>({
      query: (body) => ({
        url: '/shift/day-close',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shift'],
    }),

    // Get all shifts with filtering
    getShifts: builder.query<ShiftsResponse, ShiftQueryParams>({
      query: (params) => ({
        url: '/shift',
        params,
      }),
      providesTags: ['Shift'],
    }),

    // Get shift by ID
    getShiftById: builder.query<{ data: Shift }, string>({
      query: (id) => `/shift/${id}`,
      providesTags: ['Shift'],
    }),

    // Generate thermal receipt for day close
    generateThermalReceipt: builder.query<string, string>({
      query: (date) => ({
        url: `/day-close-report/thermal/${date}`,
        responseType: 'text',
      }),
    }),
  }),
})

export const {
  useGetCurrentShiftQuery,
  useStartShiftMutation,
  useCloseShiftMutation,
  useDayCloseMutation,
  useGetShiftsQuery,
  useGetShiftByIdQuery,
  useGenerateThermalReceiptQuery,
} = shiftApi
