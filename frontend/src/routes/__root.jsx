import { createRootRoute, Outlet } from '@tanstack/react-router';
import Header from '../components/shared/Header.jsx';

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
    </>
  ),
});
