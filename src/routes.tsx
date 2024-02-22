import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from './pages/_layouts/app'
import { NotFound } from './pages/404'
import { Dashboard } from './pages/app/dashboard/dashboard'
import { Map } from './pages/app/map/map'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/map', element: <Map /> },
    ],
  },
])
