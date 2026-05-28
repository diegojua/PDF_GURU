# VPS Contabo - Guia de Deploy

Este documento registra o estado atual da VPS e o padrão recomendado para subir novos apps sem conflitar com serviços existentes.

## Acesso

- Provedor: Contabo
- IP público IPv4: `167.86.67.184`
- Sistema: Ubuntu 24.04 LTS
- Usuário SSH usado no deploy: `root`
- Comando de acesso:

```bash
ssh root@167.86.67.184
```

Não salve senhas, chaves privadas ou tokens neste arquivo.

## Stack instalada

A VPS já possui:

- Docker
- Docker Compose
- Nginx
- Supabase self-hosted rodando em containers

Comandos úteis:

```bash
docker --version
docker compose version
nginx -t
docker ps
```

## Serviços existentes

Há serviços importantes já rodando. Antes de subir qualquer app novo, sempre verificar:

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'
ss -tulpn | grep -E ':(80|443|3000|3001|3002|8000|8443)\b' || true
ls -la /opt
```

Estado observado em 2026-05-28:

- `mbya-app` usa `127.0.0.1:3000->3000/tcp`
- Supabase usa portas internas e algumas portas locais, incluindo `127.0.0.1:8000`, `127.0.0.1:8443`, `127.0.0.1:6543`, `127.0.0.1:54322`
- PDF Guru Backend usa `0.0.0.0:3001->3000/tcp`

Evite reutilizar a porta `3000` no host. Para novos apps, prefira `3002`, `3003`, etc.

## PDF Guru Backend

Diretório remoto:

```bash
/opt/pdf-guru/backend
```

Container:

```bash
backend-api-1
```

Porta:

```text
Host 3001 -> Container 3000
```

Healthcheck:

```bash
curl http://localhost:3001/health
curl http://167.86.67.184:3001/health
```

Resposta esperada:

```json
{"status":"ok"}
```

Deploy manual:

```bash
cd /opt/pdf-guru/backend
docker compose up --build -d
docker compose ps
docker compose logs -f --tail=100
```

O arquivo `.env` remoto fica em:

```bash
/opt/pdf-guru/backend/.env
```

Ele deve conter `API_PORT=3001`, `PORT=3000`, `JWT_SECRET` e variáveis dos tenants. Não versionar esse arquivo.

## Nginx

Arquivos relevantes:

```bash
/etc/nginx/sites-available
/etc/nginx/sites-enabled
/etc/nginx/nginx.conf
```

Config criada para PDF Guru:

```bash
/etc/nginx/sites-available/pdf-guru-api
/etc/nginx/sites-enabled/pdf-guru-api
```

Conteúdo esperado:

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name api.mbya.online;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Validar Nginx:

```bash
nginx -t
systemctl reload nginx
curl -H 'Host: api.mbya.online' http://127.0.0.1/health
```

## DNS

O domínio `api.mbya.online` ainda precisa apontar para a VPS.

Registro necessário:

```text
Tipo: A
Nome: api
Valor: 167.86.67.184
```

Verificar propagação:

```bash
dig +short api.mbya.online A
```

Quando retornar `167.86.67.184`, o domínio está pronto para SSL.

## HTTPS com Certbot

Só rode Certbot depois que o DNS estiver apontando corretamente.

```bash
certbot --nginx -d api.mbya.online --email SEU_EMAIL --agree-tos --non-interactive --redirect
nginx -t
systemctl reload nginx
curl https://api.mbya.online/health
```

## Padrão para subir novo app

1. Escolha um diretório em `/opt`:

```bash
mkdir -p /opt/NOME_DO_APP
```

2. Escolha uma porta livre no host:

```bash
ss -tulpn | grep -E ':3002\b' || echo 'porta livre'
```

3. Faça o app escutar internamente em uma porta padrão, como `3000`.

4. No `docker-compose.yml`, exponha a porta do host por variável:

```yaml
services:
  app:
    build: .
    ports:
      - "${APP_PORT:-3002}:3000"
    env_file:
      - .env
    restart: unless-stopped
```

5. Crie `.env` remoto:

```env
APP_PORT=3002
PORT=3000
```

6. Suba o container:

```bash
docker compose up --build -d
docker compose ps
```

7. Crie Nginx:

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name subdominio.mbya.online;

  location / {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

8. Ative e valide:

```bash
ln -sf /etc/nginx/sites-available/NOME_DO_APP /etc/nginx/sites-enabled/NOME_DO_APP
nginx -t
systemctl reload nginx
```

9. Depois do DNS propagar, ative SSL:

```bash
certbot --nginx -d subdominio.mbya.online --email SEU_EMAIL --agree-tos --non-interactive --redirect
```

## Deploy por rsync

Do computador local:

```bash
rsync -az --delete \
  --exclude node_modules \
  --exclude dist \
  --exclude .env \
  -e "ssh -o StrictHostKeyChecking=accept-new" \
  backend/ root@167.86.67.184:/opt/pdf-guru/backend/
```

Depois, na VPS:

```bash
cd /opt/pdf-guru/backend
docker compose up --build -d
docker compose ps
```

## Checklist rapido

Antes de subir novo app:

- Verificar containers existentes com `docker ps`
- Verificar portas com `ss -tulpn`
- Não usar host port `3000`
- Criar `.env` remoto fora do git
- Configurar Nginx por subdomínio
- Só rodar Certbot depois do DNS apontar
- Validar com `curl` local e externo

