import { baseApi } from './baseApi'

export type RestaurantLocation = {
  _id: string
  name: string
  address: string
  image?: string
  createdAt?: string
  updatedAt?: string
}

export type CreateRestaurantLocationDto = {
  name: string
  address: string
  image?: string
}

export type UpdateRestaurantLocationDto = Partial<CreateRestaurantLocationDto>

export const restaurantLocationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRestaurantLocations: build.query<RestaurantLocation[], void>({
      query: () => ({ url: '/restaurant-locations', method: 'GET' }),
      transformResponse: (res: any) => res?.data ?? [],
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: 'RestaurantLocation' as const, id: _id })), { type: 'RestaurantLocation' as const, id: 'LIST' }]
          : [{ type: 'RestaurantLocation', id: 'LIST' }],
    }),
    getRestaurantLocationById: build.query<RestaurantLocation, string>({
      query: (id) => ({ url: `/restaurant-locations/${id}`, method: 'GET' }),
      transformResponse: (res: any) => res?.data,
      providesTags: (_res, _err, id) => [{ type: 'RestaurantLocation', id }],
    }),
    createRestaurantLocation: build.mutation<RestaurantLocation, CreateRestaurantLocationDto>({
      query: (body) => ({ url: '/restaurant-locations', method: 'POST', body }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: [{ type: 'RestaurantLocation', id: 'LIST' }],
    }),
    updateRestaurantLocation: build.mutation<RestaurantLocation, { id: string; data: UpdateRestaurantLocationDto }>({
      query: ({ id, data }) => ({ url: `/restaurant-locations/${id}`, method: 'PATCH', body: data }),
      transformResponse: (res: any) => res?.data,
      invalidatesTags: (_res, _err, { id }) => [{ type: 'RestaurantLocation', id }, { type: 'RestaurantLocation', id: 'LIST' }],
    }),
    deleteRestaurantLocation: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/restaurant-locations/${id}`, method: 'DELETE' }),
      transformResponse: (res: any) => ({ success: !!res?.success }),
      invalidatesTags: (_res, _err, id) => [{ type: 'RestaurantLocation', id }, { type: 'RestaurantLocation', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetRestaurantLocationsQuery,
  useGetRestaurantLocationByIdQuery,
  useCreateRestaurantLocationMutation,
  useUpdateRestaurantLocationMutation,
  useDeleteRestaurantLocationMutation,
} = restaurantLocationApi

