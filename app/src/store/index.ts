import { configureStore } from '@reduxjs/toolkit';
import { dashboardSlice } from './dashboard';
import { dashboardApi } from './dashboardApi';

export const store = configureStore({
  reducer: {
    dashboard: dashboardSlice.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dashboardApi.middleware)
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
