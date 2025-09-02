// src/types/thing.ts
export interface Thing {
  id: number;
  rule_type: string;  // ע�⣺����Ҫ��API���ص��ֶ���һ��
  rule_content: string;
  start_time?: string | null;
  end_time?: string | null;
}

export interface ThingListQuery {
  type?: string;
  keyword?: string;
}

// ����Rule���ͣ���Thing��ͬ��
export interface Rule {
  id: number;
  rule_type: string;
  rule_content: string;
  start_time?: string | null;
  end_time?: string | null;
}

// ��ѯ�������
export interface RuleQueryResult {
  items: Rule[];
  total: number;
}

// API��Ӧ���ͣ��������ᴦ�����������в���Ҫֱ��ʹ�ã�
export interface ApiResponse<T> {
  message: string;
  code: number;
  result: T;
}

