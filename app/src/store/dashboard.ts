import { createSlice } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'store';
import { SnackbarType } from 'types/snackbar';
import { UserType } from 'types/user';
import { v4 as uuid } from 'uuid';

export interface DashboardState {
  snackbar: SnackbarType;
  gameMatchId: string;
  user: UserType;
  isLoggedIn: boolean;
  refresh: number;
}

const initialState: DashboardState = {
  snackbar: { message: '', variant: 'default' },
  gameMatchId: uuid(),
  user: { name: '', email: '' },
  isLoggedIn: false,
  refresh: new Date().getTime()
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSnackbar: (state, action: PayloadAction<SnackbarType>) => {
      state.snackbar = action.payload;
    },
    setUser: (state, action: PayloadAction<UserType>) => {
      state.user = action.payload;
      state.gameMatchId = uuid();
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    logOut: (state) => {
      localStorage.clear();
      state.user = { name: '', email: '' };
      state.isLoggedIn = false;
    },
    setRefresh: (state, action: PayloadAction<number>) => {
      state.refresh = action.payload;
    }
  }
});

export const useDashboard = () =>
  useSelector((state: RootState) => state.dashboard);
// Action creators are generated for each case reducer function
export const { setSnackbar, setUser, logOut, setLoggedIn, setRefresh } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
