// src/types/thing.ts
export interface Thing {
  id: number;
  rule_type: string;  // 注意：这里要和API返回的字段名一致
  rule_content: string;
  start_time?: string | null;
  end_time?: string | null;
}

export interface ThingListQuery {
  type?: string;
  keyword?: string;
}

// 定义Rule类型（和Thing相同）
export interface Rule {
  id: number;
  rule_type: string;
  rule_content: string;
  start_time?: string | null;
  end_time?: string | null;
}

// 查询结果类型
export interface RuleQueryResult {
  items: Rule[];
  total: number;
}

// API响应类型（拦截器会处理这个，组件中不需要直接使用）
export interface ApiResponse<T> {
  message: string;
  code: number;
  result: T;
}

