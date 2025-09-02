// src/types/api.d.ts
export interface ApiResponse<T> {
  message: string;
  code: number;
  result?: T;
}

export interface RuleQueryResult {
  items: Thing[];
  total: number;
}

export interface Thing {
  id: number;
  rule_type: string;
  rule_content: string;
  start_time: string | null;
  end_time: string | null;
}
