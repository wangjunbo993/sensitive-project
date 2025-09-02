// src/utils/request.ts
import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '@/types/api';

let request: AxiosInstance | null = null;
async function createRequest(): Promise<AxiosInstance> {
  if (request) return request;
  let baseURL = import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.PROD) {
    try {
      const res = await fetch('/config.json');
      const data = await res.json();
      baseURL = data.VITE_API_BASE_URL;
    } catch (err) {
      console.error('获取 /config.json 失败', err);
    }
  }
  request = axios.create({
    baseURL,
    timeout: 10000,
  });
  request.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  request.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => { // 明确指定 response 的类型
      const res = response.data;
      if (res && typeof res.code !== 'undefined') {
        if (res.code !== 0 && res.code !== 200) {
          message.error(res.message || '请求失败');
          return Promise.reject(new Error(res.message || '请求失败'));
        }
        // 拦截器直接返回原始的 response，不改变其结构
        return response;
      }
      return response; // 同样返回原始 response
    },
    (error) => {
      const msg = error?.message || '网络错误';
      message.error(msg);
      return Promise.reject(error);
    }
  );
  return request;
}

const requestInstance: AxiosInstance = axios.create(); // 占位实例
createRequest().then((req) => {
  Object.assign(requestInstance, req); // 用真实 Axios 覆盖占位实例
});
export default requestInstance;
