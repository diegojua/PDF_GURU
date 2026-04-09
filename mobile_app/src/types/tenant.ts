export interface Tenant {
  id: string;
  name: string;
  apiBaseUrl: string;
  themeColor: string;
  logoUrl: string | null;
}

export interface TenantConfig {
  tenantId: string;
  apiBaseUrl: string;
  certificatePins?: string[];
}
