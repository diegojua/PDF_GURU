import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { Tenant } from '../types/tenant';

const normalizeBaseUrl = (baseUrl: string) => {
  if (Platform.OS === 'android' && baseUrl.includes('localhost')) {
    return baseUrl.replace('localhost', '10.0.2.2');
  }
  return baseUrl;
};

export const createApiClient = (
  tenant: Tenant,
  token: string | null,
  refreshToken: string | null,
  refreshTokenCallback?: () => Promise<string | null>
): AxiosInstance => {
  const client = axios.create({
    baseURL: normalizeBaseUrl(tenant.apiBaseUrl),
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenant.id,
      'X-Application': 'pdf-guru-mobile',
    },
  });

  client.interceptors.request.use((config) => {
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      if (
        error.response?.status === 401 &&
        refreshToken &&
        refreshTokenCallback &&
        !originalRequest?._retry
      ) {
        originalRequest._retry = true;
        const newToken = await refreshTokenCallback();
        if (newToken) {
          client.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        }
      }

      console.error('[API CLIENT] response error', error.message);
      return Promise.reject(error as Error);
    }
  );

  return client;
};
