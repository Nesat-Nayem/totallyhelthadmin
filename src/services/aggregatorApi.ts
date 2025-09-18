import { baseApi } from '@/services/baseApi'

export type Aggregator = { _id: string; name: string; logo?: string; status: 'active' | 'inactive' }

export const aggregatorApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAggregators: build.query<Aggregator[], void>({
      query: () => ({ url: '/aggregators', method: 'GET' }),
      transformResponse: (res: any) => res?.data ?? [],
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: 'Aggregator' as const, id: _id })), { type: 'Aggregator' as const, id: 'LIST' }]
          : [{ type: 'Aggregator', id: 'LIST' }],
    }),
    getAggregatorById: build.query<Aggregator, string>({
      query: (id) => ({ url: `/aggregators/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res?.data,
      providesTags: (_r, _e, id) => [{ type: 'Aggregator', id }],
    }),
    createAggregator: build.mutation<Aggregator, Partial<Aggregator>>({
      query: (body) => ({ url: '/aggregators', method: 'POST', body }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'Aggregator', id: 'LIST' }],
    }),
    updateAggregator: build.mutation<Aggregator, { id: string; data: Partial<Aggregator> }>({
      query: ({ id, data }) => ({ url: `/aggregators/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Aggregator', id }, { type: 'Aggregator', id: 'LIST' }],
    }),
    deleteAggregator: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/aggregators/${id}`, method: 'DELETE' }),
      transformResponse: (res: any) => ({ success: !!res }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Aggregator', id }, { type: 'Aggregator', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const { useGetAggregatorsQuery, useGetAggregatorByIdQuery, useCreateAggregatorMutation, useUpdateAggregatorMutation, useDeleteAggregatorMutation } = aggregatorApi
