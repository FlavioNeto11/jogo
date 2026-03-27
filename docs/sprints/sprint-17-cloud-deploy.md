# Sprint 17 — Cloud Deployment

> **Fase**: 3 — Persistência  
> **Agente Principal**: `@devops`  
> **Agentes de Apoio**: `@architect`  
> **Dependências**: Sprint 01 (Vite), Sprint 16 (Backend)  
> **Duração Estimada**: 1-2 dias  

---

## Objetivo

Deploy do jogo na web com CI/CD, CDN, HTTPS e domínio customizado. Acessível em qualquer navegador.

---

## Passo 1 — Build Optimization

**Agente**: `@devops`

**Prompt**:
```
Configure Vite para build de produção otimizado:

1. vite.config.ts:
   - Code splitting por chunk (Three.js separado)
   - Tree shaking agressivo
   - Minification com terser
   - Asset hashing para cache busting
   - Gzip/Brotli compression
   - Source maps apenas para dev

2. Targets:
   - Bundle size target: < 500KB (gzipped, sem Three.js)
   - Three.js: < 600KB (gzipped)
   - Total load: < 3s em 4G

3. Lazy loading:
   - Three.js carrega primeiro (critical)
   - Firebase carrega lazy (não bloqueia jogo)
   - Audio carrega on-demand
```

---

## Passo 2 — Firebase Hosting

**Agente**: `@devops`

**Prompt**:
```
Configure Firebase Hosting:

1. firebase.json:
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [{ "source": "**", "destination": "/index.html" }],
       "headers": [{
         "source": "**/*.@(js|css)",
         "headers": [{
           "key": "Cache-Control",
           "value": "public, max-age=31536000, immutable"
         }]
       }]
     }
   }

2. Deploy manual: firebase deploy --only hosting
3. Preview channels para testar antes de produção
```

---

## Passo 3 — GitHub Actions CI/CD

**Agente**: `@devops`

**Prompt**:
```
Crie .github/workflows/deploy.yml

name: Build & Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist/ }
  
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live

Adicionar também:
- Workflow para PR previews (preview channels)
- Badge de status no README
```

---

## Passo 4 — Performance Monitoring

**Agente**: `@devops`

**Prompt**:
```
Configure monitoramento de performance:

1. Lighthouse CI no GitHub Actions
   - Performance score > 80
   - Accessibility score > 90
   - Budget: JS < 1.2MB total

2. Bundle analyzer:
   - npm run analyze → abre visualização de bundle
   - Alerta se bundle cresce > 10%

3. Web Vitals no Firebase Performance:
   - FCP < 2s
   - LCP < 3s
   - FID < 100ms
```

---

## Checklist de Conclusão

- [ ] Build de produção < 1.2MB gzipped
- [ ] Code splitting funciona
- [ ] Firebase Hosting configurado
- [ ] Deploy automático via GitHub Actions
- [ ] PR previews funcionam
- [ ] Cache headers corretos
- [ ] HTTPS configurado
- [ ] Lighthouse score > 80
- [ ] Bundle analyzer disponível
