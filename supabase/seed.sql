-- Seed data for PDF Guru Supabase database

insert into tenants (id, name, theme_color, logo_url)
values
  ('tenant-alpha', 'PDF Guru Corporate', '#005bbf', 'https://example.com/logo-alpha.png'),
  ('tenant-bravo', 'PDF Guru Finance', '#1a6d3c', 'https://example.com/logo-bravo.png')
on conflict (id) do nothing;

insert into documents (id, tenant_id, title, modified_at, storage_path)
values
  ('10000000-0000-0000-0000-000000000001', 'tenant-alpha', 'Contrato Prestação.pdf', '2026-03-30', 'documents/tenant-alpha/Contrato-Prestacao.pdf'),
  ('10000000-0000-0000-0000-000000000002', 'tenant-alpha', 'Relatório Financeiro.pdf', '2026-03-29', 'documents/tenant-alpha/Relatorio-Financeiro.pdf'),
  ('10000000-0000-0000-0000-000000000003', 'tenant-bravo', 'Relatório de Auditoria.pdf', '2026-03-28', 'documents/tenant-bravo/Relatorio-de-Auditoria.pdf'),
  ('10000000-0000-0000-0000-000000000004', 'tenant-bravo', 'Proposta Fiscal.pdf', '2026-03-27', 'documents/tenant-bravo/Proposta-Fiscal.pdf')
on conflict (id) do nothing;
