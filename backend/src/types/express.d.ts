import { TenantDefinition } from './tenants';

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantDefinition;
      userId?: string;
    }
  }
}
