# Mercadigital — Demo

Demo navegable de la plataforma SaaS para digitalizar mayoristas locales (vertical: frutería de Mercabarna). Construida con Next.js 16 (App Router) + Tailwind CSS 4 + Zustand. Sin backend — datos hardcodeados en `src/lib/data` para enseñar el flujo end-to-end al primer cliente.

## Cuentas demo

Pega estas credenciales en `/login` para probar cada rol.

| Rol | Email | Contraseña | Qué ve |
|---|---|---|---|
| **Admin (dueño del negocio)** | `admin@frutas.com` | `admin123` | Catálogo + panel admin (`/admin/*`): dashboard, pedidos, productos. |
| **Cliente final** | el que registres en `/registro` | el que tú pongas | Solo el catálogo público y su perfil pre-rellenado. |

> Las cuentas de cliente final se guardan en `localStorage` del navegador. No hay backend — si limpias el storage o usas otro dispositivo, los registros se pierden.

## Arrancar en local

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

Rutas relevantes:

- `/` — catálogo público (sin login).
- `/?ref=tiktok-naranjas` — captura el origen del pedido.
- `/pedido` — carrito + formulario de pedido.
- `/login` y `/registro` — autenticación.
- `/admin` — dashboard (requiere admin).
- `/admin/pedidos` — gestión de pedidos + botón "Confirmar por WhatsApp".
- `/admin/productos` — edición de precios y disponibilidad.

## Estado actual

Lo que SÍ hace la demo:

- Catálogo mobile-first con 20 productos de frutería, filtros por categoría.
- Carrito persistente, flujo de pedido sin abrir WhatsApp.
- Pedido nuevo aparece en el panel admin con badge "Nuevo".
- Tracking de fuente vía `?ref=` (se ve en el dashboard).
- Auto-relleno del formulario para clientes recurrentes.
- Botón "Repetir mi último pedido" en home si hay historial.
- Login + registro + guard de `/admin`.
- Botón "Confirmar por WhatsApp" en cada pedido (`wa.me` con mensaje listo).

Lo que NO hace (queda para el producto real con Supabase):

- Backend real, multi-tenant ni Row Level Security.
- WhatsApp Business API (mensajes automáticos sin clic).
- Persistencia de pedidos entre dispositivos.
- Notificaciones push.

## Build de producción

```bash
pnpm build
pnpm start
```

## Deploy

Pensado para Vercel. Tras `vercel login`:

```bash
pnpm dlx vercel --prod
```
