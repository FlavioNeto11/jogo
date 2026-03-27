# Sprint 25 — Progressive Web App (PWA)

> **Fase**: 5 — Beyond  
> **Agente Principal**: `@devops`  
> **Agentes de Apoio**: `@ui-designer`  
> **Dependências**: Sprint 17 (Cloud Deploy), Sprint 21 (Mobile)  
> **Duração Estimada**: 1-2 dias  

---

## Objetivo

Transformar o jogo em PWA installável, com offline support, ícone na home screen e experiência app-like.

---

## Passo 1 — Manifest & Icons

**Agente**: `@devops`

**Prompt**:
```
Crie public/manifest.json:

{
  "name": "MaFe & Juju World — Família Padilha",
  "short_name": "MaFe & Juju",
  "description": "Jogo voxel 3D da Família Padilha",
  "start_url": "/",
  "display": "fullscreen",
  "orientation": "landscape",
  "background_color": "#1a1a2e",
  "theme_color": "#FF6B35",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/gameplay.png", "sizes": "1280x720", "type": "image/png" }
  ],
  "categories": ["games", "entertainment"]
}

Gerar ícones a partir do logo em múltiplos tamanhos.
Link no HTML: <link rel="manifest" href="/manifest.json">
```

---

## Passo 2 — Service Worker

**Agente**: `@devops`

**Prompt**:
```
Crie Service Worker com Workbox (via Vite plugin):

npm install -D vite-plugin-pwa

vite.config.ts:
import { VitePWA } from 'vite-plugin-pwa';

plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/cdn\.jsdelivr\.net/,
          handler: 'CacheFirst', // Three.js CDN
          options: { cacheName: 'cdn-cache', expiration: { maxEntries: 10 } }
        }
      ]
    }
  })
]

Estratégias:
- App shell: Cache First (arquivos estáticos)
- API calls: Network First (Firebase)
- Assets: Cache First com expiration
- Offline fallback: página offline custom
```

---

## Passo 3 — Offline Support

**Agente**: `@devops`

**Prompt**:
```
Garanta funcionalidade offline:

1. Jogo carrega 100% offline (após primeira visita)
2. Save/Load funciona offline (localStorage)
3. Cloud sync pausa quando offline, resume quando online
4. Indicador de status: 🟢 Online / 🔴 Offline
5. Notificação: "Você está offline. O progresso será salvo localmente."
6. Queue de ações para sync quando reconectar:
   - Cloud saves pendentes
   - Leaderboard submissions
   - Marketplace interactions
```

---

## Passo 4 — Install Prompt

**Agente**: `@ui-designer`

**Prompt**:
```
Crie prompt de instalação customizado:

1. Interceptar beforeinstallprompt event
2. Mostrar banner custom após 2 minutos de gameplay:
   "Instale MaFe & Juju World para jogar offline!"
   [Instalar] [Depois]
3. Botão de instalar também no menu Settings
4. Após instalar: "Obrigado! O jogo agora funciona offline!"
5. Não mostrar novamente se já instalado ou recusado
```

---

## Checklist de Conclusão

- [ ] manifest.json válido
- [ ] Ícones em todos os tamanhos
- [ ] Service Worker cacheia todos os assets
- [ ] Jogo funciona 100% offline
- [ ] Update automático quando nova versão
- [ ] Install prompt customizado
- [ ] Indicador online/offline
- [ ] Offline queue para sync
- [ ] Lighthouse PWA score > 90
- [ ] Installável no Chrome, Edge, Safari
