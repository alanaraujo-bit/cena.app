# CENA

Rede social nativa para cinéfilos — registre o que assiste, siga outros cinéfilos e evolua na sua **Ordem Cinéfila**. App nativo (iOS + Android) com identidade visual **Liquid Glass**.

> Interface em **português (pt-BR)**. O vocabulário cinéfilo (Ordem Cinéfila, Filme Versus, Resenha Momento) é identidade de marca, não falha de tradução.

## Monorepo

```
cena/
├─ apps/
│  ├─ mobile/     # Expo (React Native) + Expo Router + TypeScript
│  └─ api/        # Fastify + TypeScript
├─ packages/
│  └─ shared/     # Schemas Zod + tipos compartilhados (cliente ↔ servidor)
├─ turbo.json  pnpm-workspace.yaml  tsconfig.base.json
```

Ferramentas: **pnpm** (workspaces) + **Turborepo**. Node ≥ 20.

## Como rodar (desenvolvimento)

Na raiz do projeto:

```bash
pnpm install
```

### API (backend)

```bash
cp apps/api/.env.example apps/api/.env    # ajuste os segredos
pnpm --filter @cena/api dev               # sobe em http://localhost:3333
```

Teste: `curl http://localhost:3333/health`

### Mobile (app)

```bash
pnpm --filter @cena/mobile start          # abre o Expo Dev Server
```

- **Simulador iOS:** a API já é acessível via `localhost`.
- **Emulador Android:** usa `http://10.0.2.2:3333` (automático).
- **Celular físico:** crie `apps/mobile/.env` com o IP da sua máquina na rede, ex.:
  ```
  EXPO_PUBLIC_API_URL=http://192.168.18.116:3333
  ```

## Design system — Liquid Glass

- Tokens tipados de tema em `apps/mobile/src/theme` (cores, espaçamento, raios, tipografia, blur, motion).
- Dois temas de primeira classe (claro e escuro), alternáveis em Perfil → Aparência.
- Componentes base em `apps/mobile/src/design-system` (`GlassSurface`, `GlassCard`, `GlassTabBar`,
  `PrimaryButton`, `GlassTextField`, `SegmentedControl`, `Screen`, `Icon`, `AppBackground`).
- Nunca use hex fixo em componentes — consuma via `useTheme()`.

## Build para dispositivo (EAS)

Configurado em `apps/mobile/eas.json` (perfis `development`, `preview`, `production`).
TestFlight (iOS) e Google Play Internal Testing (Android) desde cedo.

```bash
cd apps/mobile
eas build --profile development --platform ios
```

## Roadmap (milestones)

1. ✅ **Base**: monorepo, tema, design system, casca de 5 abas, `/health`, EAS.
2. ✅ **Auth + onboarding** (JWT access/refresh, argon2).
3. ✅ **Catálogo** (TMDB) + detalhe + 3 estados de "assistir".
4. ✅ **Perfil** (próprio + público) + moldura padrão.
5. ✅ **Feed** + interações sociais.
6. ✅ **Ordem Cinéfila (ICG)** + ranking.
7. ✅ **Notificações** (in-app + push).
8. Molduras (biblioteca, presente, animadas).
9. Filme Versus.
10. RevenueCat + paywall + premium.
11. Assets de loja + submissão.

## Verificação

```bash
pnpm --filter @cena/shared typecheck
pnpm --filter @cena/api typecheck
pnpm --filter @cena/mobile exec tsc --noEmit
cd apps/mobile && npx expo-doctor      # 20/20 checks
```
