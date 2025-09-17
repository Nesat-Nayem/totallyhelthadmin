import { baseApi } from '@/services/baseApi'

export type Brand = { _id: string; name: string; logo?: string; status: 'active' | 'inactive' }

export const brandApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBrands: build.query<Brand[], void>({
      query: () => ({ url: '/brands', method: 'GET' }),
      transformResponse: (res: any) => res?.data ?? [],
      providesTags: (result) =>
        result ? [...result.map(({ _id }) => ({ type: 'Brand' as const, id: _id })), { type: 'Brand' as const, id: 'LIST' }] : [{ type: 'Brand', id: 'LIST' }],
    }),
    getBrandById: build.query<Brand, string>({
      query: (id) => ({ url: `/brands/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res?.data,
      providesTags: (_r, _e, id) => [{ type: 'Brand' as const, id }],
    }),
    createBrand: build.mutation<Brand, Partial<Brand>>({
      query: (body) => ({ url: '/brands', method: 'POST', body }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
    }),
    updateBrand: build.mutation<Brand, { id: string; data: Partial<Brand> }>({
      query: ({ id, data }) => ({ url: `/brands/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Brand', id }, { type: 'Brand', id: 'LIST' }],
    }),
    deleteBrand: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/brands/${id}`, method: 'DELETE' }),
      transformResponse: (res: any) => ({ success: !!res }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Brand', id }, { type: 'Brand', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const { useGetBrandsQuery, useGetBrandByIdQuery, useCreateBrandMutation, useUpdateBrandMutation, useDeleteBrandMutation } = brandApi

