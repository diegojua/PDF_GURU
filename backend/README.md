# PDF Guru Backend

Este backend serve como um servidor de desenvolvimento multitenant para o app PDF Guru.

## Como usar
1. Vá para o diretório do backend:
   ```bash
   cd backend
   ```
2. Instale dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm run dev
   ```

## Endpoints principais
- `GET /health` - healthcheck para Docker/Nginx
- `POST /auth/login` - autenticação multitenant
- `POST /auth/refresh` - refresh token
- `GET /documents` - lista de documentos por tenant
- `GET /documents/:documentId/download` - URL de download do documento

## Cabeçalhos obrigatórios
- `X-Tenant-ID`: `tenant-alpha` ou `tenant-bravo`
- `Authorization`: `Bearer <token>` para endpoints protegidos

## Usuários de teste
- tenant-alpha: `admin@alpha.com` / `Alpha123!`
- tenant-bravo: `admin@bravo.com` / `Bravo123!`

## Teste rápido
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "X-Tenant-ID: tenant-alpha" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alpha.com","password":"Alpha123!"}'
```

## Docker local
1. Crie o arquivo `.env` a partir de `.env.example`.
   Se a porta `3000` já estiver ocupada no host, defina `API_PORT`, por exemplo:
   ```env
   API_PORT=3001
   ```
2. Suba o container:
   ```bash
   docker compose up --build
   ```
3. Verifique o healthcheck:
   ```bash
   curl http://localhost:3000/health
   ```

## Deploy na VPS Contabo
1. Aponte um domínio/subdomínio para o IP público da VPS.
2. Rode o setup inicial na VPS:
   ```bash
   sudo ./vps-setup.sh api.seudominio.com admin@seudominio.com
   ```
3. Crie `/opt/pdf-guru/backend/.env` na VPS com os valores reais de produção.
   Use `API_PORT=3001` se a porta `3000` já estiver ocupada.
4. Configure os secrets no GitHub:
   - `VPS_HOST`
   - `VPS_USER`
   - `VPS_SSH_KEY`
5. Faça push para `main` ou dispare o workflow `Deploy Backend` manualmente.
