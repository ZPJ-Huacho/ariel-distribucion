# Mercadigital

App fullstack para un negocio mayorista: catálogo público con pedidos por WhatsApp y panel admin.

Stack: **Next.js 16** (App Router) · **Neon Postgres** + **Drizzle ORM** · **Auth.js v5** · **Cloudflare R2** · **TanStack Query** + **axios** (client) · **Vercel**.

## Convención de arquitectura

Separación clara **backend / frontend**:

- **`src/core/` — Backend por dominio (Clean/Hexagonal).** Un módulo por entidad o capacidad.
  Cada uno con `domain/` (models + ports) + `application/` (use cases) + `infrastructure/` (adapters).
- **`src/features/` — Frontend por pantalla.** Cada uno con `ui/` (components, views) + `api/` (hooks TanStack Query + funciones axios).
- **`src/shared/` — Compartido.** Atoms de UI, organismos reutilizados, cliente HTTP con interceptors, providers, DB, env.
- **`src/app/` — Solo routing.** Pages thin que renderizan una view del feature. Route handlers thin que invocan un use case.

Los componentes **NO llaman `fetch` directo**. Llaman a hooks TanStack en `features/<x>/api/use*.ts`. Los hooks llaman al cliente axios (`shared/infrastructure/http/{publicApi,privateApi}.ts`), que tiene interceptors para normalizar errores en `AppError`.

```
src/
├── app/                           # Thin routing
│   ├── api/…/route.ts             # invocan use case
│   ├── admin/**/page.tsx          # → <FeatureView />
│   ├── layout.tsx                 # QueryProvider + SettingsProvider
│   └── page.tsx
│
├── core/                          # Backend (dominio)
│   ├── shared/                    # Session, Role, DomainError
│   ├── settings/                  # tabla settings
│   ├── categories/                # tabla categories
│   ├── products/                  # tabla products (+ upload de imagen)
│   ├── orders/                    # tabla orders
│   ├── users/                     # tabla users
│   ├── auth/                      # Auth.js v5 + guards
│   └── storage/                   # abstracción R2 (S3 SDK)
│
├── features/                      # Frontend (pantallas)
│   ├── catalog/                   # Home público
│   ├── order/                     # Carrito + WhatsApp
│   ├── auth/                      # Login + Registro + Logout
│   ├── profile/                   # Perfil (edit + password)
│   ├── admin-dashboard/           # /admin
│   ├── admin-products/            # /admin/productos
│   ├── admin-categories/          # /admin/categorias
│   ├── admin-orders/              # /admin/pedidos
│   └── admin-settings/            # /admin/ajustes
│
├── shared/
│   ├── components/
│   │   ├── atoms/                 # Button, Input, Label, Textarea… (shadcn)
│   │   └── organisms/
│   │       ├── Header/            # sticky header con carrito
│   │       └── SiteFooter/
│   ├── infrastructure/http/       # axios publicApi + privateApi + interceptors
│   ├── providers/                 # QueryProvider, SettingsProvider
│   ├── lib/                       # db (schema + client), env, format, theme, i18n, cart-store, utils
│   └── hooks/
│
├── middleware.ts                  # protege /admin (Auth.js edge-safe config)
│
drizzle/                           # migraciones + seed.sql
drizzle.config.ts
```

## Data-fetching

- **Lecturas iniciales del catálogo público**: Server Component (`CatalogView`) llama al use case directamente. Cero JS al cliente para la lista.
- **Admin (CRUD + estados)**: componentes cliente usan hooks TanStack (`useProducts`, `useCreateProduct`, etc.) que consumen los endpoints `/api/...` a través de `axios` con interceptors. Invalidación de queries en `onSuccess`.
- **Formularios de auth**: `signIn` / `signOut` de `next-auth/react`. Registro con TanStack mutation antes de firmar.

## Setup

1. **Neon.** Crea la base y copia la connection string.
2. **R2.** Crea el bucket, habilita **Public Access** (dominio `pub-xxxx.r2.dev`), crea un token con permisos Object Read/Write.
3. **Env.** Copia `.env.example` a `.env.local` y rellena. Genera `AUTH_SECRET` con `openssl rand -base64 32`.
4. **Migrar.**
   ```bash
   pnpm install
   pnpm db:push
   psql "$DATABASE_URL" -f drizzle/seed.sql
   ```
5. **Admin inicial.** Regístrate en `/registro` y en Neon Studio: `UPDATE users SET role='admin' WHERE email='tu@correo';`.
6. **Dev.** `pnpm dev` y abrir [http://localhost:3000](http://localhost:3000).

## Deploy Vercel

Root Directory = raíz. Añade env vars, deploy.

## Comandos

```bash
pnpm dev            # Next dev
pnpm build          # build
pnpm typecheck      # tsc --noEmit
pnpm db:push        # sync schema con Neon
pnpm db:studio      # Drizzle Studio
```

Credenciales de acceso:
- Email: admin@mercadigital.local
- Password: Admin1234


prompt: 


"A highly detailed, professional product photograph of a specific [FRUTA O VERDURA] packed densely in a rustic, aged wooden crate, identical in construction to the crate seen in image_17.png. The crate features a distinct, realistic branding printed directly onto the front-facing plank, which reads 'ARIEL DISTRIBUCIÓN' in a clean, professional, dark blue font, exactly like the branding in image_17.png. The crate is positioned centrally on the same rough, weathered wooden table surface, against the same warm, softly blurred, and out-of-focus rustic cellar background from image_17.png. The lighting is soft and directional, highlighting the natural textures of the [FRUTA O VERDURA] and the wood grain. The perspective is a 3/4 view. Shallow depth of field focuses sharply on the crate and the front rows of the produce."