import { baseApi } from './baseApi'

// Enhanced interfaces for day close reports
export interface DayCloseReport {
  _id: string
  shiftNumber: number
  startDate: string
  startTime: string
  endDate?: string
  endTime?: string
  status: 'open' | 'closed' | 'day-close'
  branchId?: string
  createdBy?: string
  closedBy?: string
  loginName?: string
  logoutTime?: string
  note?: string
  denominations?: {
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
  sales?: {
    totalOrders: number
    totalSales: number
    payments: {
      cash: number
      card: number
      online: number
    }
  }
  createdAt: string
  updatedAt: string
}

export interface DayCloseReportQuery {
  page?: number
  limit?: number
  date?: string
  startDate?: string
  endDate?: string
  status?: 'open' | 'closed' | 'day-close'
  sortBy?: 'startTime' | 'endTime' | 'status' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface DayCloseReportResponse {
  success: boolean
  statusCode: number
  message: string
  data: DayCloseReport[]
  total: number
  date: string
  sales: {
    dayWise: {
      totalOrders: number
      totalSales: number
      payments: {
        cash: number
        card: number
        online: number
      }
    }
    shiftWise: {
      totalOrders: number
      totalSales: number
      payments: {
        cash: number
        card: number
        online: number
      }
    }
    summary: {
      totalShifts: number
      dayCloseTime: string
      closedBy: string
    }
  }
}

// New interface for day-wise and shift-wise report data
export interface DayWiseShiftWiseReportResponse {
  success: boolean
  statusCode: number
  message: string
  data: DayCloseReport[]
  total: number
  date: string
  sales: {
    dayWise: {
      totalOrders: number
      totalSales: number
      payments: {
        cash: number
        card: number
        online: number
      }
    }
    shiftWise: {
      totalOrders: number
      totalSales: number
      payments: {
        cash: number
        card: number
        online: number
      }
    }
    summary: {
      totalShifts: number
      dayCloseTime: string
      closedBy: string
    }
  }
}

// New interfaces for grouped shifts
export interface ShiftGroup {
  date: string
  shifts: DayCloseReport[]
  statistics: {
    totalShifts: number
    openShifts: number
    closedShifts: number
    dayCloseShifts: number
    totalCash: number
    firstShiftTime: string | null
    lastShiftTime: string | null
  }
  shiftCount: number
}

export interface GroupedShiftsResponse {
  success: boolean
  statusCode: number
  message: string
  data: ShiftGroup[]
  meta: {
    page: number
    limit: number
    total: number
    pages: number
    totalShifts: number
    dateRange: {
      from: string | null
      to: string | null
    }
  }
}

export interface DayShiftsResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    date: string
    shifts: DayCloseReport[]
    statistics: {
      totalShifts: number
      openShifts: number
      closedShifts: number
      dayCloseShifts: number
      totalCash: number
      firstShiftTime: string | null
      lastShiftTime: string | null
    }
  }
  total: number
}

export interface CurrentDayShiftsResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    date: string
    shifts: DayCloseReport[]
    statistics: {
      totalShifts: number
      openShifts: number
      closedShifts: number
      dayCloseShifts: number
      totalCash: number
      isDayClosed: boolean
      hasOpenShifts: boolean
      firstShiftTime: string | null
      lastShiftTime: string | null
    }
    currentTime: string
    timezone: string
  }
  total: number
}

export interface DownloadReportParams {
  format: 'csv' | 'excel' | 'pdf'
  date?: string
  startDate?: string
  endDate?: string
  reportIds?: string[]
}

export const dayCloseApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOpenDayClose: build.query<{ data: any }, void>({
      query: () => ({ url: '/day-close/open' }),
      providesTags: ['DayClose'],
    }),
    
    // Enhanced day close reports with advanced filtering
    getDayCloseReports: build.query<DayCloseReportResponse, DayCloseReportQuery>({
      query: (params) => ({
        url: '/day-close-report',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          date: params.date,
          startDate: params.startDate,
          endDate: params.endDate,
          status: params.status,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      }),
      providesTags: ['DayClose'],
    }),
    
    // New grouped shifts endpoints
    getShiftsGroupedByDay: build.query<GroupedShiftsResponse, DayCloseReportQuery>({
      query: (params) => ({
        url: '/day-close-report/shifts/grouped',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          date: params.date,
          startDate: params.startDate,
          endDate: params.endDate,
          status: params.status,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      }),
      providesTags: ['DayClose'],
    }),
    
    getShiftsByDay: build.query<DayShiftsResponse, string>({
      query: (date) => ({
        url: `/day-close-report/shifts/day/${date}`,
      }),
      providesTags: ['DayClose'],
    }),
    
    getCurrentDayShifts: build.query<CurrentDayShiftsResponse, void>({
      query: () => ({
        url: '/day-close-report/shifts/current-day',
      }),
      providesTags: ['DayClose'],
    }),
    
    // Get day close reports by specific date
    getDayCloseReportsByDate: build.query<{ success: boolean; data: DayCloseReport[]; total: number; date: string }, string>({
      query: (date) => ({
        url: `/day-close-report/date/${date}`,
      }),
      providesTags: ['DayClose'],
    }),
    
    // Get day-wise and shift-wise reports by date
    getDayWiseShiftWiseReportsByDate: build.query<DayWiseShiftWiseReportResponse, string>({
      query: (date) => ({
        url: `/day-close-report/date/${date}`,
      }),
      providesTags: ['DayClose'],
    }),
    
    // Download day close reports
    downloadDayCloseReports: build.mutation<Blob, DownloadReportParams>({
      query: (params) => ({
        url: '/day-close-report/download',
        method: 'GET',
        params: {
          format: params.format,
          date: params.date,
          startDate: params.startDate,
          endDate: params.endDate,
          reportIds: params.reportIds?.join(','),
        },
        responseType: 'blob',
      }),
      transformResponse: (response: Blob) => {
        return response
      },
    }),
    
    // Delete day close reports by date
    deleteDayCloseReportsByDate: build.mutation<{ success: boolean; deletedCount: number; date: string }, string>({
      query: (date) => ({
        url: `/day-close-report/date/${date}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, date) => [
        'DayClose',
        { type: 'DayClose', id: 'LIST' }
      ],
    }),
    
    // Delete single day close report by ID
    deleteDayCloseReportById: build.mutation<{ success: boolean; deletedCount: number; reportId: string }, string>({
      query: (id) => ({
        url: `/day-close-report/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        'DayClose',
        { type: 'DayClose', id },
        { type: 'DayClose', id: 'LIST' }
      ],
    }),
    
    // Legacy endpoints for backward compatibility
    getDayCloses: build.query<{ data: any[]; meta: any }, { page?: number; limit?: number; date?: string } | void>({
      query: (args) => ({
        url: '/day-close',
        params: {
          page: args?.page ?? 1,
          limit: args?.limit ?? 20,
          date: args?.date || undefined,
        },
      }),
      providesTags: ['DayClose'],
    }),
    getDayCloseById: build.query<{ data: any }, string>({
      query: (id) => ({ url: `/day-close-report/${id}` }),
      providesTags: (res, err, id) => [{ type: 'DayClose' as const, id }],
    }),
    startDayClose: build.mutation<{ message: string; data: any }, { startTime?: string | Date; note?: string } | void>({
      query: (body) => ({ url: '/day-close/start', method: 'POST', body }),
      invalidatesTags: ['DayClose', { type: 'Order', id: 'LIST' } as any],
    }),
    closeDayClose: build.mutation<{ message: string; data: any }, { id: string; endTime?: string | Date; note?: string }>({
      query: ({ id, ...body }) => ({ url: `/day-close/${id}/close`, method: 'POST', body }),
      invalidatesTags: ['DayClose', { type: 'Order', id: 'LIST' } as any],
    }),
  }),
})

export const {
  useGetOpenDayCloseQuery,
  useGetDayCloseReportsQuery,
  useGetDayCloseReportsByDateQuery,
  useGetDayWiseShiftWiseReportsByDateQuery,
  useDownloadDayCloseReportsMutation,
  useDeleteDayCloseReportsByDateMutation,
  useDeleteDayCloseReportByIdMutation,
  useGetDayClosesQuery,
  useGetDayCloseByIdQuery,
  useStartDayCloseMutation,
  useCloseDayCloseMutation,
  useLazyGetDayCloseByIdQuery,
  // New grouped shifts hooks
  useGetShiftsGroupedByDayQuery,
  useGetShiftsByDayQuery,
  useGetCurrentDayShiftsQuery,
} = dayCloseApi