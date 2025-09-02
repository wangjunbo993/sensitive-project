// src/router/routes.ts
import { lazy } from 'react';
import type { AppRoute } from '@/types/router';

const Home = lazy(() => import('@/pages/Home'));

const routes: AppRoute[] = [
  {
    path: '/',
    element: Home,
    exact: true,
    meta: {
      title: '首页',
      auth: false,
    },
  },
];

export default routes;
