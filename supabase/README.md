# Supabase Database Setup for PDF Guru

This folder contains the SQL schema and seed helpers for the Supabase backend used by the mobile app.

## Preparação
1. Crie um projeto Supabase em https://app.supabase.com.
2. Vá em Settings > API e copie:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Configure o bucket de storage:
   - Nome: `documents`
   - Public access: `false`

## Criar esquema
Execute o SQL em `supabase/schema.sql` no seu projeto Supabase. Você pode usar o SQL Editor do Supabase ou a CLI.

## Popular dados
Execute o SQL em `supabase/seed.sql` para criar tenants e documentos de exemplo.

## Criar usuários
1. Instale dependências:
   ```bash
   cd supabase
   npm install
   ```
2. Execute a seed de usuários com as variáveis:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
   npm run seed
   ```
3. Os usuários criados são:
   - tenant-alpha: `admin@alpha.com` / `Alpha123!`
   - tenant-alpha: `user@alpha.com` / `Alpha123!`
   - tenant-bravo: `admin@bravo.com` / `Bravo123!`
   - tenant-bravo: `user@bravo.com` / `Bravo123!`

## Observações
- O `profiles` armazena a associação entre `auth.users` e o `tenant_id`.
- As políticas de RLS em `documents` somente permitem acessar documentos do mesmo tenant.
- O app usa `mobile_app/src/services/supabaseClient.ts` para conectar com Supabase.
