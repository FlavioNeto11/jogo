# Sprint 24 — Content Marketplace & Sharing

> **Fase**: 5 — Beyond  
> **Agente Principal**: `@network`  
> **Agentes de Apoio**: `@ui-designer`, `@devops`  
> **Dependências**: Sprint 16 (Backend), Sprint 23 (Editor)  
> **Duração Estimada**: 3-4 dias  

---

## Objetivo

Plataforma para compartilhar criações (schematics, mundos) entre jogadores, com avaliações e destaques.

---

## Passo 1 — Sharing API

**Agente**: `@network`

**Prompt**:
```
Crie src/services/MarketplaceService.ts

class MarketplaceService {
  // Upload
  async publishSchematic(schematic: Schematic, metadata: PublishMetadata): Promise<string>;
  async publishWorld(worldData: SaveData, metadata: PublishMetadata): Promise<string>;
  
  // Browse
  async getFeatured(): Promise<MarketplaceItem[]>;
  async getRecent(page: number): Promise<MarketplaceItem[]>;
  async getPopular(page: number): Promise<MarketplaceItem[]>;
  async search(query: string): Promise<MarketplaceItem[]>;
  async getByAuthor(uid: string): Promise<MarketplaceItem[]>;
  
  // Interaction
  async download(itemId: string): Promise<Schematic | SaveData>;
  async rate(itemId: string, stars: number): Promise<void>;
  async report(itemId: string, reason: string): Promise<void>;
  
  // My uploads
  async getMyUploads(): Promise<MarketplaceItem[]>;
  async deleteUpload(itemId: string): Promise<void>;
}

interface MarketplaceItem {
  id: string;
  type: 'schematic' | 'world';
  title: string;
  description: string;
  author: { uid: string; displayName: string };
  thumbnail: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  createdAt: Date;
  size: { x: number; y: number; z: number }; // Para schematics
}

FIRESTORE:
marketplace/{itemId} — metadata
marketplace/{itemId}/data — actual content (com size limit)
marketplace/{itemId}/ratings/{uid} — user ratings
```

---

## Passo 2 — Marketplace UI

**Agente**: `@ui-designer`

**Prompt**:
```
Crie interfaces do marketplace:

1. Marketplace Browser (abre com M):
   - Tabs: Featured | Popular | Recent | My Uploads
   - Grid de cards com thumbnail, título, autor, rating
   - Search bar com filtros (type, tags)
   - Pagination

2. Item Detail:
   - Preview 3D do schematic (render isolado)
   - Título, descrição, autor
   - Rating stars (clickable)
   - Download button
   - Report button
   - Tags

3. Publish Dialog:
   - Título e descrição
   - Tags (autocomplete)
   - Thumbnail (auto-generated ou upload)
   - Preview antes de publicar
   - Terms of use checkbox

4. My Uploads:
   - Lista com stats (downloads, rating)
   - Edit/Delete options
```

---

## Checklist de Conclusão

- [ ] Publish schematic funciona
- [ ] Browse marketplace funciona
- [ ] Search e filtros funcionam
- [ ] Download e import funciona
- [ ] Rating system funciona
- [ ] Report funciona
- [ ] Marketplace UI completa
- [ ] Thumbnails auto-generated
- [ ] Moderation básica (report)
- [ ] My uploads management
