import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from 'config';
import { ChatResponseType, DashboardType } from 'types/dashboard';

// Define a service using a base URL and expected endpoints
export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    getS3ListFiles: builder.query<any, null>({
      query: () => ({
        url: '/list-files',
        method: 'GET'
      })
    }),
    getDashboardData: builder.query<DashboardType, { path: string }>({
      query: ({ path }) => ({
        url: '/analysis',
        method: 'GET',
        params: {
          path
        }
      })
    }),
    sendChat: builder.mutation<ChatResponseType, { message: string }>({
      query: ({ message }) => ({
        url: '/chat',
        method: 'POST',
        body: {
          message
        }
      })
    })
  })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetS3ListFilesQuery,
  useGetDashboardDataQuery,
  useLazyGetDashboardDataQuery,
  useSendChatMutation
} = dashboardApi;
