# PDF_GURU — Histórico da Conversa

**Data:** 5 de abril de 2026  
**Projeto:** PDF Guru Mobile (Expo Bare Workflow — Android)

---

## Resumo das Sessões

### Sessão 1 — Skill de Auditoria
- Usuário pediu para criar uma skill chamada `auditoria`
- Criada em `C:\Users\Diego\.copilot\skills\auditoria\` com:
  - `SKILL.md` (procedimento, níveis de severidade, template de relatório)
  - `references/seguranca.md` (OWASP Top 10, secrets, mobile security)
  - `references/qualidade.md` (TypeScript/React code smells, error handling)
  - `references/dependencias.md` (npm audit, lockfile, licenças)
  - `references/performance.md` (N+1, re-renders, bundle size, listas)
  - `references/arquitetura.md` (arquitetura em camadas, acoplamento, convenções)

---

### Sessão 2 — Auditoria do Projeto PDF_GURU

**Problemas críticos encontrados:**

| Severidade | Problema |
|------------|----------|
| 🔴 CRÍTICO | JWT secret hardcoded no código |
| 🔴 CRÍTICO | Senhas de tenants em plaintext no código |
| 🟠 ALTO | CORS aberto (sem allowlist) |
| 🟠 ALTO | Sem rate limiting no endpoint de login |
| 🟠 ALTO | URL assinada do Supabase exposta na UI |
| 🟠 ALTO | `(req as any)` no TypeScript — bypass de tipos |
| 🟡 MÉDIO | Sem paginação nas queries Supabase |
| 🟡 MÉDIO | Permissões Android excessivas (3 removidas) |
| 🔵 BAIXO | Sem ErrorBoundary no React |
| 🔵 BAIXO | 23 vulnerabilidades HIGH no npm (Expo 49) |

**Fixes aplicados:**
- `backend/src/tenants.ts` — JWT/senhas movidos para `process.env`
- `backend/src/server.ts` — CORS allowlist + `express-rate-limit` (10 req/15min)
- `backend/src/types/express.d.ts` — criado (augmentação de tipos Express)
- `backend/.env`, `.env.example`, `.gitignore` — criados
- `mobile_app/src/services/pdfService.ts` — `.limit(50)` adicionado
- `mobile_app/android/app/src/main/AndroidManifest.xml` — 3 permissões removidas
- `mobile_app/src/components/ErrorBoundary.tsx` — criado
- `mobile_app/src/App.tsx` — wrapped com `<ErrorBoundary>`

---

### Sessão 3 — Avaliação de Store Readiness

**Conclusão:** App **não estava pronto** para as lojas. Checklist de bloqueadores:

- ❌ Sem pasta `ios/` (Windows — sem macOS/Xcode)
- ❌ Release usando debug keystore
- ❌ URLs `localhost:3000` hardcoded
- ❌ Sem ícone/splash real
- ❌ Viewer PDF era mock (sem conteúdo real)
- ❌ `uploadDocument()` era stub vazio
- ❌ 23 HIGH vuln (Expo 49 desatualizado)
- ❌ Sem `eas.json`
- ❌ Sem privacy policy

---

### Sessão 4 — Sequência Completa de Store Readiness

**Todos os 9 passos foram executados:**

#### ✅ 1. Instalar pacotes
```
npm install react-native-webview expo-document-picker expo-file-system
```

#### ✅ 2. Corrigir Supabase + implementar upload real
- Arquivo: `mobile_app/src/services/pdfService.ts`
- Correção: coluna `modifiedAt` → `modified_at` (snake_case)
- Upload implementado: `expo-document-picker` → `expo-file-system` (base64) → Supabase Storage → insert na tabela `documents`
- Constructor aceita `tenantId?: string`

#### ✅ 3. Implementar viewer PDF real
- Arquivo: `mobile_app/src/screens/PdfViewerScreen.tsx`
- Substituído mock por `react-native-webview` real
- Loading overlay com `ActivityIndicator`
- Estado de erro com botão retry

#### ✅ 4. HomeScreen com busca funcional
- Arquivo: `mobile_app/src/screens/HomeScreen.tsx`
- `TextInput` com filtro live (`filteredDocuments` memo)
- Botão upload com spinner
- Ícones dinâmicos por tipo de documento
- Empty state quando sem resultados

#### ✅ 5. Upgrade Expo 49 → 55 (RN 0.72 → 0.83, React 18 → 19)

**Resultado: 0 vulnerabilidades npm (era 23 HIGH)**

Versões após upgrade:
```json
{
  "expo": "~55.0.11",
  "react": "19.2.0",
  "react-native": "0.83.4",
  "react-native-gesture-handler": "~2.31.0",
  "react-native-safe-area-context": "~5.7.0",
  "react-native-screens": "~4.24.0",
  "expo-constants": "~55.0.11",
  "expo-crypto": "~55.0.12",
  "expo-document-picker": "~55.0.11",
  "expo-file-system": "~55.0.14",
  "expo-secure-store": "~55.0.11",
  "expo-splash-screen": "~55.0.15",
  "expo-status-bar": "~55.0.5"
}
```

**Arquivos Android migrados:**

| Arquivo | Mudança |
|---------|---------|
| `android/build.gradle` | NDK 27.1, compileSdk 36, Kotlin 2.1.20, removido JSC antigo |
| `android/app/build.gradle` | hermesCommand atualizado, removido Flipper, plugin Kotlin |
| `android/gradle-wrapper.properties` | Gradle 8.7 → 9.0.0-bin |
| `android/gradle.properties` | `newArchEnabled=true`, removido Flipper/Jetifier |
| `android/settings.gradle` | Novo formato com `pluginManagement` + Expo autolinking |
| `MainApplication.java` | Novo padrão: `ReactHost` via `ExpoReactHostFactory` |
| `MainActivity.java` | Simplificado, removido `invokeDefaultOnBackPressed` deprecated |
| `ReactNativeFlipper.java` (debug/release) | Stubs vazios (Flipper removido no RN 0.74+) |
| `AndroidManifest.xml` | `supportsRtl=true`, SDK version 55, `smallestScreenSize` |

#### ✅ 6. Keystore de produção
- Arquivo: `android/gradle.properties`
  ```
  MYAPP_UPLOAD_STORE_FILE=release.keystore
  MYAPP_UPLOAD_KEY_ALIAS=pdf-guru
  MYAPP_UPLOAD_STORE_PASSWORD=
  MYAPP_UPLOAD_KEY_PASSWORD=
  ```
- Arquivo: `android/app/build.gradle`
  - Adicionado `signingConfigs.release` condicional
  - Release build agora aponta para `signingConfigs.release`

#### ✅ 7. eas.json
- Criado em `mobile_app/eas.json`
- Perfis: `development` (APK interno), `preview` (APK distribuição), `production` (AAB)

#### ✅ 8. app.json configurado
- Nome: "PDF Guru"
- `icon`, `splash`, `adaptiveIcon` apontando para `assets/`
- `android.versionCode: 1`
- Plugins: `expo-secure-store`, `expo-document-picker`, `expo-splash-screen`
- `extra.eas.projectId` (aguarda `eas init`)
- Assets placeholder criados em `mobile_app/assets/` (substituir por reais)

#### ✅ 9. URLs localhost → variável de ambiente
- `app.config.js` — adicionado `API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:3000'`
- `TenantContext.tsx` — importa `expo-constants`, lê `API_BASE_URL` do `extra`
- Logos `example.com` → `null` (tipo atualizado para `string | null`)
- `.env` — adicionada variável `API_BASE_URL`

---

## Estado Final do Projeto

### TypeScript: ✅ 0 erros
### npm audit: ✅ 0 vulnerabilidades

---

## Pendências — Ações que o Usuário Precisa Fazer

### 🔴 Obrigatórias antes de qualquer build de produção

1. **Gerar keystore real:**
   ```bash
   keytool -genkey -v -keystore android/app/release.keystore -alias pdf-guru -keyalg RSA -keysize 2048 -validity 10000
   ```
   Depois preencher no `android/gradle.properties`:
   ```
   MYAPP_UPLOAD_STORE_PASSWORD=sua_senha_aqui
   MYAPP_UPLOAD_KEY_PASSWORD=sua_senha_aqui
   ```

2. **Substituir assets placeholder** por imagens reais:
   - `assets/icon.png` — 1024×1024 px, sem transparência
   - `assets/splash.png` — qualquer tamanho, resizeMode: contain
   - `assets/adaptive-icon.png` — 1024×1024 px, com transparência OK

3. **Definir URL de produção do backend** em `mobile_app/.env`:
   ```
   API_BASE_URL=https://api.seudominio.com
   ```

4. **Inicializar EAS:**
   ```bash
   eas init
   # Copiar o projectId gerado para app.json → extra.eas.projectId
   ```

### 🟠 Importantes para publicação

5. **Testar build Android:**
   ```bash
   npx expo run:android          # build local
   # ou
   eas build --platform android --profile production  # build na nuvem
   ```

6. **Resolver dissonância JWT:** Mobile usa Supabase Auth JWT; Backend usa JWT próprio (`JWT_SECRET` no `.env`). Os tokens não são mutuamente verificáveis. Solução: eliminar o backend próprio e usar Supabase direto, ou implementar JWKS validation.

7. **Adicionar privacy policy** — obrigatório para aprovação em ambas as lojas.

8. **iOS:** Sem pasta `ios/`. Para App Store, precisará de um Mac ou usar `eas build --platform ios`.

---

## Estrutura de Arquivos Criados/Modificados

```
PDF_GURU/
├── mobile_app/
│   ├── .env                          ← API_BASE_URL adicionada
│   ├── app.json                      ← icon, splash, plugins, versionCode
│   ├── app.config.js                 ← API_BASE_URL no extra
│   ├── eas.json                      ← NOVO
│   ├── package.json                  ← Expo 55, RN 0.83.4, React 19
│   ├── assets/
│   │   ├── icon.png                  ← NOVO (placeholder — substituir)
│   │   ├── splash.png                ← NOVO (placeholder — substituir)
│   │   └── adaptive-icon.png         ← NOVO (placeholder — substituir)
│   ├── android/
│   │   ├── build.gradle              ← SDK 36, NDK 27, Kotlin 2.1
│   │   ├── gradle.properties         ← newArchEnabled=true, keystore vars
│   │   ├── settings.gradle           ← novo formato pluginManagement
│   │   ├── gradle/wrapper/
│   │   │   └── gradle-wrapper.properties ← Gradle 9.0.0
│   │   └── app/
│   │       ├── build.gradle          ← hermesCommand, signingConfigs.release
│   │       └── src/
│   │           ├── debug/.../ReactNativeFlipper.java  ← stub vazio
│   │           ├── release/.../ReactNativeFlipper.java ← stub vazio
│   │           └── main/
│   │               ├── AndroidManifest.xml ← supportsRtl, SDK 55, configChanges
│   │               └── java/com/pdfguru/mobile/
│   │                   ├── MainApplication.java ← ReactHost + ExpoReactHostFactory
│   │                   └── MainActivity.java    ← simplificado
│   └── src/
│       ├── App.tsx                   ← wrapped com ErrorBoundary
│       ├── components/
│       │   └── ErrorBoundary.tsx     ← NOVO
│       ├── context/
│       │   └── TenantContext.tsx     ← expo-constants, API_BASE_URL, logoUrl null
│       ├── navigation/
│       │   └── AppNavigator.tsx      ← documentTitle param adicionado
│       ├── screens/
│       │   ├── HomeScreen.tsx        ← busca, upload real, ícones dinâmicos
│       │   └── PdfViewerScreen.tsx   ← WebView real, loading, error/retry
│       ├── services/
│       │   └── pdfService.ts         ← modified_at, uploadDocument() real
│       └── types/
│           └── tenant.ts             ← logoUrl: string | null
├── backend/
│   ├── .env                          ← NOVO (JWT_SECRET, ALLOWED_ORIGINS)
│   ├── .env.example                  ← NOVO
│   ├── .gitignore                    ← NOVO
│   └── src/
│       ├── server.ts                 ← CORS allowlist, rate limiting
│       ├── tenants.ts                ← JWT/senhas via process.env
│       └── types/
│           └── express.d.ts          ← NOVO (augmentação de Request)
└── CHAT.md                           ← ESTE ARQUIVO
```
