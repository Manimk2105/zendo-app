import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';

const router = createMemoryRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
