import { Platform } from 'react-native';
import { Tenant } from '../types/tenant';
import { normalizeLocalhostForAndroid } from '../utils/network';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: { email: string; name: string };
}

const normalizeUrl = (url: string): string => {
  return normalizeLocalhostForAndroid(url, Platform.OS);
};

export class AuthService {
  constructor(private tenant: Tenant) {}

  async login(email: string, password: string): Promise<LoginResponse | null> {
    try {
      const response = await fetch(`${normalizeUrl(this.tenant.apiBaseUrl)}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.tenant.id,
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as LoginResponse;
    } catch {
      return null;
    }
  }

  async refreshToken(currentRefreshToken: string): Promise<string | null> {
    try {
      const response = await fetch(`${normalizeUrl(this.tenant.apiBaseUrl)}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.tenant.id,
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return (data.token as string) ?? null;
    } catch {
      return null;
    }
  }
}
