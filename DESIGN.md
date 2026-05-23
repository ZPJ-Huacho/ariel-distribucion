# Sistema de diseño · Mercadigital

Esta guía resume los colores, tipografías y espaciados que usa la aplicación,
para que sea coherente entre desarrolladores y para que sirva de **referencia
al diseñador del logo**.

---

## 1. Personalidad

Mayorista mediterráneo de fruta y verdura desde Mercabarna, que vende a
restaurantes y familias bien seleccionadas a través de TikTok.

- **Profesional**, no infantil.
- **Mediterráneo**, no corporativo frío.
- **Premium accesible**: el cliente nota la calidad sin sentirse fuera de
  mercado.
- **Fresco**: producto del día, lonja, color real.

Cómo se traduce en visual:

| ✅ Hacer | ❌ Evitar |
|---|---|
| Verdes profundos con vida | Verde lima brillante / fluo |
| Crema cálida tipo papel | Gris frío corporativo |
| Tipografía serif para titulares | Tipografía script o "manuscrita" |
| Toques mostaza/terracota | Rosas, púrpuras, azules saturados |
| Bordes finos, esquinas suaves | Sombras pesadas y gradientes coloridos |

---

## 2. Paleta

Tres familias semánticas más una escala de neutros. Todas están declaradas en
`src/app/globals.css` como tokens de Tailwind v4 (`--color-*`), accesibles
desde clases tipo `bg-brand-500`, `text-secondary-700`, `border-accent-300`,
`bg-[var(--color-canvas)]`, etc.

### 2.1 Primary · Verde Mercabarna

El color de marca. Producto fresco, lonja, confianza. Se usa para el botón
primario, el monograma, el header del admin, la línea de acento del catálogo.

| Token | Hex | Uso típico |
|---|---|---|
| `brand-50`  | `#eff7ed` | Fondo de badges suaves, hover muy claro |
| `brand-100` | `#d6ebd1` | Surface tinted (estados "rellenado por ti") |
| `brand-200` | `#abd1a1` | Outline / divisores en componentes |
| `brand-300` | `#7eb771` | Ilustraciones secundarias |
| `brand-400` | `#5b9c4a` | Indicadores de estado positivo |
| `brand-500` | `#428233` | **Brand puro · focus ring · gráficos** |
| `brand-600` | `#336627` | Hover sobre brand-500 |
| `brand-700` | `#294f1f` | Bordes oscuros, texto de marca |
| `brand-800` | `#1f3c18` | **Botón primario (background)** |
| `brand-900` | `#142810` | Borde oscuro, sombras |

### 2.2 Secondary · Terracota mediterránea

Calidez Mediterránea, fruta madura, atardecer en Barcelona. Acompaña a la
marca verde sin pelearse con ella. Se usa para llamar la atención sobre
acciones secundarias, bandas promocionales y badges de "pedido recurrente".

| Token | Hex | Uso típico |
|---|---|---|
| `secondary-50`  | `#fdf3eb` | Banner de aviso suave |
| `secondary-100` | `#fadec7` | Highlight de fila |
| `secondary-200` | `#f5b889` | Estado "preparando" |
| `secondary-300` | `#ed934e` | Iconos decorativos |
| `secondary-400` | `#e2772a` | Pictogramas |
| `secondary-500` | `#c25b18` | **CTA secundario** |
| `secondary-600` | `#984712` | Hover sobre secondary-500 |
| `secondary-700` | `#71350d` | Texto sobre fondos claros |

### 2.3 Accent · Mostaza dorada

Toque premium, "Selección de hoy", labels muy pequeños. Nunca llena un área
grande, solo realza.

| Token | Hex | Uso típico |
|---|---|---|
| `accent-50`  | `#fbf6e1` | Fondo de badge "Selección" |
| `accent-100` | `#f3e6ad` | **Texto sobre brand-800** (botones) |
| `accent-200` | `#e6cf64` | Hover sobre accent-100 |
| `accent-300` | `#d3b62d` | Iconos pequeños |
| `accent-400` | `#ad9420` | Texto sobre crema |
| `accent-500` | `#847118` | Borde decorativo |
| `accent-600` | `#5e5012` | — |
| `accent-700` | `#423808` | **Etiqueta "CATEGORÍA · HOY"** |

### 2.4 Neutros · Off-white tibio

Buscamos un fondo claro, casi blanco, pero con un punto cálido para que la
pantalla no se sienta clínica. Suficientemente luminoso para que el contenido
respire; suficiente carácter para que no se confunda con un dashboard
corporativo.

| Token | Hex | Uso |
|---|---|---|
| `--color-canvas` | `#fbfaf6` | Fondo de página (off-white tibio) |
| `--color-canvas-soft` | `#f3f0e6` | Surface elevada suave (badges, fondos secundarios) |
| `--color-canvas-deep` | `#1f2917` | Footer oscuro |
| `--color-surface` | `#ffffff` | Cards limpias, modales |
| `--color-line` | `#e7e1cf` | Borde normal |
| `--color-line-soft` | `#efeadb` | Divisor sutil |
| `--color-ink` | `#18170f` | Texto principal (casi negro, tibio) |
| `--color-ink-soft` | `#4d4a3e` | Texto secundario |
| `--color-ink-mute` | `#8a8478` | Captions, placeholders |

---

## 3. Tipografía

Pairing clásico: una sans limpia para todo el cuerpo, una serif editorial
para los titulares grandes. La jerarquía sale del cambio de familia + peso
+ tamaño.

- **Mulish** (`--font-sans`) — texto general, párrafos, labels, formularios,
  tablas. Sans geométrica usada como **reemplazo gratuito de Gilroy**.
  Pesos: 300, 400, 500, 600, 700, 800. Si más adelante se compra la
  licencia de Gilroy, se sustituye por `next/font/local`.
- **Playfair Display** (`--font-serif`, helper `.font-display`) — titulares
  grandes (hero, nombres de sección, nombre de producto en cards). Serif
  editorial con alto contraste vertical y carácter elegante. Pesos: 400,
  500, 600, 700, 800. Aplicado vía la clase `.font-display` con peso 600 y
  `letter-spacing: -0.015em`.

Reglas:
- Las medidas tipográficas usan rem, no px, para que escalen con la
  accesibilidad del navegador.
- Para tabular numbers (precios, cantidades, dashboards) usamos siempre
  `tabular-nums` para que los dígitos no salten.
- Uppercase + tracking ancho (`tracking-[0.14em]–[0.2em]`) reservado a
  etiquetas pequeñas (CATEGORÍA, ESTADO, MAYORISTA · HOY). No para texto largo.

---

## 4. Estructura

- **Contenedor principal**: `max-w-6xl` (1152 px) centrado con `px-4 lg:px-6`.
  Suficiente espacio en escritorio sin sentirse perdido.
- **Checkout (`/pedido`)**: `max-w-2xl` (672 px) — formulario.
- **Auth (`/login`, `/registro`)**: `max-w-md` — tarjeta sola.
- **Cards de producto**: `rounded-md` (6 px), borde `--color-line`, sin
  sombras pesadas. Las imágenes ocupan toda la cabecera con `object-cover`.
- **Botones primarios**: `rounded-md`, fondo `brand-800`, texto `accent-100`,
  hover `brand-900`. Padding cómodo, uppercase + tracking en los CTA fuertes.
- **min-width: 320 px** en `body` para que en viewports muy estrechos haya
  scroll horizontal en vez de aplastar el layout.

---

## 5. Guía para el logo

Cuando el cliente encargue el logo, estas son las pistas para mantener
coherencia visual.

**Colores principales**

- Color principal del logo: `brand-700` `#294f1f` o `brand-800` `#1f3c18`
  sobre fondo claro (off-white o blanco). Versión inversa: `accent-100`
  `#f3e6ad` sobre fondo `brand-800`.
- Si el logo necesita un detalle de acento (un punto, una hoja, una caja):
  `secondary-500` `#c25b18` (terracota) o `accent-400` `#ad9420` (mostaza).

**Tipografía sugerida**

- Para el wordmark, **Playfair Display** en bold/700 (la misma que usa la
  app para titulares) da un acabado editorial coherente con la marca. Si el
  cliente quiere algo más distintivo, una **serif moderna con contraste**
  (Recoleta, Canela, GT Sectra) encaja perfectamente con la personalidad
  mediterránea.
- Evitar scripts manuscritas, slab serifs rígidas y sans tech ultra-finas —
  chocan con el carácter editorial de los titulares.

**Estilo**

- Una sola tinta + acento. Nada de gradientes brillantes.
- Si lleva ilustración: una hoja, una caja de mercado, una M de monograma.
- Pensar en cómo se ve impreso en una caja, una etiqueta y un perfil de
  TikTok redondo de 96 px.

**Don'ts**

- Verde fluor o lima saturado.
- Tipografías manuscritas tipo "fresh bakery".
- Iconografía infantil (fruta sonriente con ojos).
- Más de tres colores en el logo principal.
