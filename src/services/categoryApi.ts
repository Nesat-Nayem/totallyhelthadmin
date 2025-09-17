import { baseApi } from '@/services/baseApi'

export type Category = { _id: string; title: string; image?: string }

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<Category[], void>({
      query: () => ({ url: '/categories', method: 'GET' }),
      transformResponse: (res: any) => res?.data ?? [],
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: 'Category' as const, id: _id })), { type: 'Category' as const, id: 'LIST' }]
          : [{ type: 'Category', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const { useGetCategoriesQuery } = categoryApi
