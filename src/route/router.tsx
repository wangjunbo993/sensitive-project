// src/router/router.tsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import routes from './routes';
import Loading from '@/components/Loading';
import RequireAuth from '@/components/RequireAuth';
import type { AppRoute } from '@/types/router';

function renderRoute(route: AppRoute) {
  const Element = route.element; // ? ����������
  const elementNode = (
    <Suspense fallback={<Loading />}>
      <Element />
    </Suspense>
  );

  const wrapped = route.meta?.auth ? <RequireAuth>{elementNode}</RequireAuth> : elementNode;

  return (
    <Route key={route.path} path={route.path} element={wrapped}>
      {route.children?.map((child) => renderRoute(child))}
    </Route>
  );
}

const RouterConfig: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {routes.map((r) => renderRoute(r))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default RouterConfig;
