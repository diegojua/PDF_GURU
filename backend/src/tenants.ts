import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

export type TenantId = 'tenant-alpha' | 'tenant-bravo';

export interface TenantUser {
  email: string;
  password: string;
  name: string;
  userId: string;
}

export interface TenantDocument {
  id: string;
  title: string;
  modifiedAt: string;
}

export interface TenantDefinition {
  id: TenantId;
  name: string;
  users: TenantUser[];
  documents: TenantDocument[];
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. See .env.example');
}

const e = process.env;

export const tenants: TenantDefinition[] = [
  {
    id: 'tenant-alpha',
    name: 'PDF Guru Corporate',
    users: [
      { email: 'admin@alpha.com', password: e.TENANT_ALPHA_USER1_PASSWORD ?? '', name: 'Alice Alpha', userId: uuidv4() },
      { email: 'user@alpha.com', password: e.TENANT_ALPHA_USER2_PASSWORD ?? '', name: 'Victor Alpha', userId: uuidv4() },
    ],
    documents: [
      { id: 'doc-1', title: 'Contrato Prestação.pdf', modifiedAt: '2026-03-30' },
      { id: 'doc-2', title: 'Relatório Financeiro.pdf', modifiedAt: '2026-03-29' },
    ],
  },
  {
    id: 'tenant-bravo',
    name: 'PDF Guru Finance',
    users: [
      { email: 'admin@bravo.com', password: e.TENANT_BRAVO_USER1_PASSWORD ?? '', name: 'Bruno Bravo', userId: uuidv4() },
      { email: 'user@bravo.com', password: e.TENANT_BRAVO_USER2_PASSWORD ?? '', name: 'Valeria Bravo', userId: uuidv4() },
    ],
    documents: [
      { id: 'doc-3', title: 'Relatório de Auditoria.pdf', modifiedAt: '2026-03-28' },
      { id: 'doc-4', title: 'Proposta Fiscal.pdf', modifiedAt: '2026-03-27' },
    ],
  },
];

export const jwtSecret: string = process.env.JWT_SECRET;
export const tokenExpiration = (process.env.TOKEN_EXPIRATION ?? '1h') as import('jsonwebtoken').SignOptions['expiresIn'];
