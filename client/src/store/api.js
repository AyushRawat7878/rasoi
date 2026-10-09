import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { loggedOut } from './authSlice'

// RTK Query: every call to the server is defined here once. Components just use the hooks
// (useGetMenuQuery, usePlaceOrderMutation...) and get loading / error / data for free.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: (import.meta.env.VITE_API_URL || '') + '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

// If the server says the login expired, log out
const baseQuery = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra)
  if (result.error?.status === 401 && api.getState().auth.token) api.dispatch(loggedOut())
  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Menu', 'Order'],
  endpoints: (build) => ({
    // Auth
    login: build.mutation({ query: (body) => ({ url: '/auth/login', method: 'POST', body }) }),
    register: build.mutation({ query: (body) => ({ url: '/auth/register', method: 'POST', body }) }),

    // Menu
    getMenu: build.query({
      query: ({ diet = 'all', q = '', all = false } = {}) => ({
        url: '/menu',
        params: {
          ...(diet === 'veg' && { veg: true }),
          ...(diet === 'nonveg' && { veg: false }),
          ...(q && { q }),
          ...(all && { all: true }),
        },
      }),
      providesTags: ['Menu'],
    }),
    addDish: build.mutation({ query: (body) => ({ url: '/menu', method: 'POST', body }), invalidatesTags: ['Menu'] }),
    updateDish: build.mutation({
      query: ({ id, ...body }) => ({ url: `/menu/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Menu'],
    }),
    deleteDish: build.mutation({ query: (id) => ({ url: `/menu/${id}`, method: 'DELETE' }), invalidatesTags: ['Menu'] }),

    // Orders
    placeOrder: build.mutation({ query: (body) => ({ url: '/orders', method: 'POST', body }), invalidatesTags: ['Order'] }),
    getMyOrders: build.query({ query: () => '/orders/mine', providesTags: ['Order'] }),
    getOrder: build.query({ query: (id) => `/orders/${id}`, providesTags: ['Order'] }),
    cancelOrder: build.mutation({ query: (id) => ({ url: `/orders/${id}/cancel`, method: 'POST' }), invalidatesTags: ['Order'] }),
    getAllOrders: build.query({
      query: (status) => ({ url: '/orders', params: status ? { status } : {} }),
      providesTags: ['Order'],
    }),
    setOrderStatus: build.mutation({
      query: ({ id, status }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Order'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMenuQuery,
  useAddDishMutation,
  useUpdateDishMutation,
  useDeleteDishMutation,
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
  useGetAllOrdersQuery,
  useSetOrderStatusMutation,
} = api

// Turn an RTK Query error into a sentence for the user
export function errorText(error) {
  if (!error) return ''
  if (error.data?.message) return error.data.message
  if (error.status === 'FETCH_ERROR') return 'Cannot reach the server. Is it running?'
  return 'Something went wrong. Please try again.'
}
