import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import { Tenant } from '../types/tenant';
import { SecureStorage } from '../services/secureStorage';
import { AuthService } from '../services/authService';

const apiBaseUrl: string =
  (Constants.expoConfig?.extra?.API_BASE_URL as string | undefined) ?? 'http://localhost:3000';

interface TenantContextValue {
  selectedTenant: Tenant | null;
  setSelectedTenant: (tenant: Tenant | null) => Promise<void>;
  tenants: Tenant[];
  authToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

const defaultTenants: Tenant[] = [
  {
    id: 'tenant-alpha',
    name: 'PDF Guru Corporate',
    apiBaseUrl,
    themeColor: '#005bbf',
    logoUrl: null,
  },
  {
    id: 'tenant-bravo',
    name: 'PDF Guru Finance',
    apiBaseUrl,
    themeColor: '#1a6d3c',
    logoUrl: null,
  },
];

export const TenantProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [selectedTenant, setSelectedTenantState] = useState<Tenant | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuthToken = useCallback(async (): Promise<string | null> => {
    if (!selectedTenant || !refreshToken) {
      return null;
    }

    const authService = new AuthService(selectedTenant);
    const newToken = await authService.refreshToken(refreshToken);

    if (!newToken) {
      await logout();
      return null;
    }

    await SecureStorage.setItem('token', newToken, selectedTenant.id);
    setAuthToken(newToken);
    return newToken;
  }, [selectedTenant, refreshToken]);

  useEffect(() => {
    const initialize = async () => {
      const tenantId = await SecureStorage.getSelectedTenantId();
      if (tenantId) {
        const tenant = defaultTenants.find((item) => item.id === tenantId) ?? null;
        setSelectedTenantState(tenant);
        if (tenant) {
          const savedToken = await SecureStorage.getItem('token', tenant.id);
          const savedRefreshToken = await SecureStorage.getItem('refreshToken', tenant.id);
          setAuthToken(savedToken);
          setRefreshToken(savedRefreshToken);

          if (!savedToken && savedRefreshToken) {
            await refreshAuthToken();
          }
        }
      }
      setIsLoading(false);
    };

    initialize();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!selectedTenant) {
      return false;
    }

    const authService = new AuthService(selectedTenant);
    const loginResponse = await authService.login(email, password);

    if (!loginResponse?.token || !loginResponse.refreshToken) {
      return false;
    }

    await SecureStorage.setItem('token', loginResponse.token, selectedTenant.id);
    await SecureStorage.setItem('refreshToken', loginResponse.refreshToken, selectedTenant.id);
    setAuthToken(loginResponse.token);
    setRefreshToken(loginResponse.refreshToken);
    return true;
  };

  const logout = async (): Promise<void> => {
    if (!selectedTenant) return;

    await SecureStorage.deleteItem('token', selectedTenant.id);
    await SecureStorage.deleteItem('refreshToken', selectedTenant.id);
    await SecureStorage.deleteSelectedTenantId();
    setSelectedTenantState(null);
    setAuthToken(null);
    setRefreshToken(null);
  };

  const setSelectedTenant = async (tenant: Tenant | null) => {
    setSelectedTenantState(tenant);
    if (tenant) {
      await SecureStorage.setSelectedTenantId(tenant.id);
      const token = await SecureStorage.getItem('token', tenant.id);
      const refresh = await SecureStorage.getItem('refreshToken', tenant.id);
      setAuthToken(token);
      setRefreshToken(refresh);

      if (!token && refresh) {
        await refreshAuthToken();
      }
    } else {
      await SecureStorage.deleteSelectedTenantId();
      setAuthToken(null);
      setRefreshToken(null);
    }
  };

  const value = useMemo(
    () => ({
      selectedTenant,
      setSelectedTenant,
      tenants: defaultTenants,
      authToken,
      login,
      logout,
      isLoading,
    }),
    [selectedTenant, authToken, refreshToken, isLoading],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenantContext = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};
