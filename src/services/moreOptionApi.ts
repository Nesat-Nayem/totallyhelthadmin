import { baseApi } from '@/services/baseApi'

export type MoreOption = { _id: string; name: string; category: 'more' | 'less' | 'without' | 'general'; status: 'active' | 'inactive' }

export const moreOptionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMoreOptions: build.query<MoreOption[], void>({
      query: () => ({ url: '/more-options', method: 'GET' }),
      transformResponse: (res: any) => res?.data ?? [],
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: 'MoreOption' as const, id: _id })), { type: 'MoreOption' as const, id: 'LIST' }]
          : [{ type: 'MoreOption', id: 'LIST' }],
    }),
    getMoreOptionById: build.query<MoreOption, string>({
      query: (id) => ({ url: `/more-options/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res?.data,
      providesTags: (_r, _e, id) => [{ type: 'MoreOption', id }],
    }),
    createMoreOption: build.mutation<MoreOption, { name: string; category: 'more' | 'less' | 'without' | 'general'; status?: 'active' | 'inactive' }>({
      query: (body) => ({ url: '/more-options', method: 'POST', body }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'MoreOption', id: 'LIST' }],
    }),
    updateMoreOption: build.mutation<MoreOption, { id: string; data: Partial<MoreOption> }>({
      query: ({ id, data }) => ({ url: `/more-options/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'MoreOption', id }, { type: 'MoreOption', id: 'LIST' }],
    }),
    deleteMoreOption: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/more-options/${id}`, method: 'DELETE' }),
      transformResponse: (res: any) => ({ success: !!res }),
      invalidatesTags: (_r, _e, id) => [{ type: 'MoreOption', id }, { type: 'MoreOption', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const { useGetMoreOptionsQuery, useGetMoreOptionByIdQuery, useCreateMoreOptionMutation, useUpdateMoreOptionMutation, useDeleteMoreOptionMutation } = moreOptionApi
