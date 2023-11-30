import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Dashboard, PageNotFound, Root } from 'pages';
import { store } from './store';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';



const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: <Dashboard />
      },
      {
        path: '/login',
        element: <Dashboard />
      },
      {
        path: '/audio-tool',
        element: <Dashboard />
      },
      {
        path: '/game-mode',
        element: <Dashboard />
      },
      {
        path: '/payment',
        element: <Dashboard />
      },
      {
        path: '/results',
        element: <Dashboard />
      },
      {
        path: '/match',
        element: <Dashboard />
      },
      {
        path: '/range-test',
        element: <Dashboard />
      },
      {
        path: '/archives',
        element: <Dashboard />
      },
      {
        path: '/faq',
        element: <Dashboard />
      }
    ],
    errorElement: <PageNotFound />
  }
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3}>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      </ThemeProvider>
    </SnackbarProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
