// src/types/router.ts
import type { LazyExoticComponent, ComponentType } from 'react';

export type AppRoute = {
  /** ·�� */
  path: string;

  /** ҳ���������ͨ����� lazy ����� */
  element: LazyExoticComponent<ComponentType<object>> | ComponentType<object>;

  /** �ϸ�ƥ�� */
  exact?: boolean;

  /** ��·�� */
  children?: AppRoute[];

  /** �Զ���Ԫ��Ϣ */
  meta?: {
    auth?: boolean;
    title?: string;
    hidden?: boolean;
  };
};
