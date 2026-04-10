import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app';

describe('backend auth and documents', () => {
  it('returns token for valid login', async () => {
    const response = await request(app)
      .post('/auth/login')
      .set('x-tenant-id', 'tenant-alpha')
      .send({ email: 'admin@alpha.com', password: process.env.TENANT_ALPHA_USER1_PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTypeOf('string');
    expect(response.body.refreshToken).toBeTypeOf('string');
  });

  it('rejects documents route without token', async () => {
    const response = await request(app).get('/documents').set('x-tenant-id', 'tenant-alpha');

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('authorization headers are required');
  });

  it('allows listing documents with valid access token', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .set('x-tenant-id', 'tenant-alpha')
      .send({ email: 'admin@alpha.com', password: process.env.TENANT_ALPHA_USER1_PASSWORD });

    const response = await request(app)
      .get('/documents')
      .set('x-tenant-id', 'tenant-alpha')
      .set('authorization', `Bearer ${loginResponse.body.token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.documents)).toBe(true);
    expect(response.body.documents.length).toBeGreaterThan(0);
  });

  it('returns a new access token with valid refresh token', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .set('x-tenant-id', 'tenant-alpha')
      .send({ email: 'admin@alpha.com', password: process.env.TENANT_ALPHA_USER1_PASSWORD });

    const response = await request(app)
      .post('/auth/refresh')
      .set('x-tenant-id', 'tenant-alpha')
      .send({ refreshToken: loginResponse.body.refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTypeOf('string');
  });

  it('returns a document download URL for existing document', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .set('x-tenant-id', 'tenant-alpha')
      .send({ email: 'admin@alpha.com', password: process.env.TENANT_ALPHA_USER1_PASSWORD });

    const docsResponse = await request(app)
      .get('/documents')
      .set('x-tenant-id', 'tenant-alpha')
      .set('authorization', `Bearer ${loginResponse.body.token}`);

    const firstId = docsResponse.body.documents[0].id as string;

    const response = await request(app)
      .get(`/documents/${firstId}/download`)
      .set('x-tenant-id', 'tenant-alpha')
      .set('authorization', `Bearer ${loginResponse.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.url).toContain(firstId);
  });
});
