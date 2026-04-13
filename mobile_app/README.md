# PDF Guru Mobile

Este projeto é uma implementação inicial de um app mobile multiplataforma (Android/iOS) para PDF Guru com arquitetura multitenant e segurança reforçada.

## Objetivo

- App nativo multiplataforma usando Expo/React Native
- Multitenancy com tenant context e API tenant-aware
- Armazenamento seguro de credenciais por tenant
- Tela de seleção de tenant e login por tenant
- Serviços isolados para autenticação e upload/download de PDF

## Como usar

1. Instale dependências:
   ```bash
   cd mobile_app
   npm install --legacy-peer-deps
   ```
2. Inicie o app:
   ```bash
   npm start
   ```
3. Configure o backend Supabase:
   - copie `mobile_app/.env.example` para `mobile_app/.env`
   - preencha `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `API_BASE_URL` e `EAS_PROJECT_ID` no arquivo `.env`
   - execute `npm install` em `mobile_app` para carregar `dotenv`
   - crie o banco usando os arquivos em `supabase/schema.sql` e `supabase/seed.sql`
   - execute `supabase/seedUsers.js` usando o `SUPABASE_SERVICE_ROLE_KEY`
   - reinicie o Expo para carregar a configuração de chaves

4. Rode no Android ou iOS via Expo.

## Gerar APK (EAS)

1. Instale e autentique no EAS CLI:
   - `npm install -g eas-cli`
   - `eas login`
2. Vincule o projeto uma vez (se necessario):
   - `cd mobile_app`
   - `eas init`
3. Gere APK de preview:
   - `npm run apk:preview`
4. Gere APK de development:
   - `npm run apk:development`

## Publicar Android (Google Play)

1. Garanta que a API de producao esteja correta no `mobile_app/.env`:
   - `API_BASE_URL=https://api.seu-dominio.com`
2. Coloque a chave da service account do Google Play em:
   - `mobile_app/google-play-key.json`
3. Gere o bundle de producao (AAB):
   - `npm run aab:production`
4. Envie para a Play Store (track production):
   - `npm run submit:production`
5. Opcional (build + submit em sequencia):
   - `npm run publish:android`

## Credenciais de teste locais

- tenant-alpha: `admin@alpha.com` / `Alpha123!`
- tenant-bravo: `admin@bravo.com` / `Bravo123!`

## Estrutura

- `src/App.tsx`: ponto de entrada do app
- `src/context/TenantContext.tsx`: estado multitenant
- `src/services`: serviços de autenticação, armazenamento seguro e API
- `src/screens`: telas de seleção de tenant, login, home e visualização de PDF

## Próximos passos

- Implementar serviços de backend real para login e tenant discovery
- Integrar módulo nativo de visualização de PDF e sandboxing seguro
- Adicionar proteção de certificate pinning e autenticação biométrica
- Migrar o design dos protótipos HTML do workspace para componentes React Native
