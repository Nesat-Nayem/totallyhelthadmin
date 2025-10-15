import { baseApi } from '@/services/baseApi'

export type OrderItem = { productId?: string; title: string; price: number; qty: number }
export type ExtraItem = { name: string; price: number; qty?: number }

export type OrderCreateDto = {
  invoiceNo?: string
  date: string | Date
  customer?: { id?: string; name: string; phone?: string }
  items: OrderItem[]
  extraItems?: ExtraItem[]
  subTotal: number
  total: number
  startDate?: string
  endDate?: string
  // paymentMode?: string // Commented out - using paymentType instead
  orderType?: 'DineIn' | 'TakeAway' | 'Delivery' | 'online' | 'NewMembership' | 'MembershipMeal'
  branchId?: string
  brand?: string
  aggregatorId?: string
  paymentMethodId?: string
  status?: 'paid' | 'unpaid'
  salesType?: 'restaurant' | 'online' | 'membership'
  payments?: Array<{ type: 'Cash' | 'Card' | 'Gateway'; amount: number }>
  vatPercent?: number
  vatAmount?: number
  discountType?: 'flat' | 'percent'
  discountAmount?: number
  shippingCharge?: number
  rounding?: number
  payableAmount?: number
  receiveAmount?: number
  cumulativePaid?: number
  changeAmount?: number
  dueAmount?: number
  note?: string
}

export type Order = OrderCreateDto & { _id: string; invoiceNo: string; orderNo?: string }

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation<Order, OrderCreateDto>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    getOrders: build.query<{ data: Order[]; meta: any; summary: any }, { q?: string; page?: number; limit?: number; status?: string; startDate?: string; endDate?: string; salesType?: string; customerId?: string; aggregatorId?: string; branchId?: string; orderType?: string; canceled?: boolean } | void>({
      query: (params) => ({ url: '/orders', method: 'GET', params: params ?? {} }),
      providesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    holdMembership: build.mutation<Order, string>({
      query: (orderId) => ({ url: `/orders/${orderId}/membership/hold`, method: 'POST' }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    unholdMembership: build.mutation<Order, string>({
      query: (orderId) => ({ url: `/orders/${orderId}/membership/unhold`, method: 'POST' }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    cancelOrder: build.mutation<Order, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/orders/${id}/cancel`, method: 'POST', body: { reason } }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    updateOrder: build.mutation<Order, { id: string; data: Partial<OrderCreateDto> }>({
      query: ({ id, data }) => ({ url: `/orders/${id}`, method: 'PUT', body: data }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    getPaidOrdersToday: build.query<{ data: Order[]; summary: any; date: string }, { branchId?: string } | void>({
      query: (params) => ({ url: '/orders/today/paid', method: 'GET', params: params ?? {} }),
      providesTags: [{ type: 'Order', id: 'PAID_TODAY' }],
    }),
    getUnpaidOrdersToday: build.query<{ data: Order[]; summary: any; date: string }, { branchId?: string } | void>({
      query: (params) => ({ url: '/orders/today/unpaid', method: 'GET', params: params ?? {} }),
      providesTags: [{ type: 'Order', id: 'UNPAID_TODAY' }],
    }),
  }),
  overrideExisting: true,
})

export const { useCreateOrderMutation, useGetOrdersQuery, useHoldMembershipMutation, useUnholdMembershipMutation, useCancelOrderMutation, useUpdateOrderMutation, useGetPaidOrdersTodayQuery, useGetUnpaidOrdersTodayQuery } = orderApi
