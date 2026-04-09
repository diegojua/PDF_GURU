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
