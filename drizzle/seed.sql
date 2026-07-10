-- Seed inicial: singleton de settings + admin + catálogo de prueba.
-- Ideal para arrancar y probar el flujo completo end-to-end.
--
-- Aplicar:
--   psql "$DATABASE_URL" -f drizzle/seed.sql
-- o pegar en el SQL Editor de Neon.
--
-- Los productos van SIN imagen (image_key = NULL). Sube las imágenes
-- desde /admin/productos cuando quieras probar R2.

------------------------------------------------------------------
-- 1) Ajustes del negocio (fila única con id=1).
------------------------------------------------------------------
INSERT INTO settings (
  id, business_name, tagline, whatsapp_number, address, delivery_hours, theme
) VALUES (
  1,
  'Frutería Mercabana',
  'Fruta y verdura fresca de Mercabana',
  '+34600000000',
  'Mercabana, Barcelona',
  'Lunes a sábado · 8:00 — 14:00',
  'default'
)
ON CONFLICT (id) DO NOTHING;

------------------------------------------------------------------
-- 2) Usuario admin inicial.
--    email    → admin@mercadigital.local
--    password → Admin1234
--    Cambia el password desde /perfil después del primer login.
------------------------------------------------------------------
INSERT INTO users (email, password_hash, name, phone, role) VALUES (
  'admin@mercadigital.local',
  '$2a$10$5p6r4vSPp9xMDd454szyh.55x7LYYuxK9cCocEfN5q.TlV0dtcKQu',
  'Admin',
  NULL,
  'admin'
)
ON CONFLICT (email) DO NOTHING;

------------------------------------------------------------------
-- 3) Categorías (UUIDs fijos para que los productos las referencien).
------------------------------------------------------------------
INSERT INTO categories (id, slug, title, lead, icon, sort_order, active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'frutas',     'Frutas de temporada', 'Recogidas en lonja a primera hora', '🍎', 1, true),
  ('00000000-0000-0000-0000-000000000002', 'verduras',   'Verduras frescas',    'Calidad Mercabana, todos los días', '🥬', 2, true),
  ('00000000-0000-0000-0000-000000000003', 'tropical',   'Tropical',            'Producto maduro al punto',          '🥑', 3, true),
  ('00000000-0000-0000-0000-000000000004', 'hortalizas', 'Hortalizas',          'Cebollas, ajos y básicos',          '🧅', 4, true),
  ('00000000-0000-0000-0000-000000000005', 'tuberculos', 'Tubérculos',          'Patatas y boniatos frescos',        '🥔', 5, true)
ON CONFLICT (id) DO NOTHING;

------------------------------------------------------------------
-- 4) Productos (17 items sin imagen, precios en euros).
------------------------------------------------------------------
INSERT INTO products (id, category_id, name, description, price, unit, emoji, gradient, image_key, available, highlighted, sort_order) VALUES
  -- Frutas
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Manzanas Fuji',            'Crujientes y dulces, las que más piden.',            18,   'caja 8 kg',    '🍎', 'from-rose-300 to-red-500',      NULL, true,  true,  1),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Naranjas de zumo',         'Finas de piel, mucho líquido.',                      22,   'caja 15 kg',   '🍊', 'from-amber-300 to-orange-500',  NULL, true,  true,  2),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Peras Conferencia',        'Jugosas y perfumadas, para postre.',                 16,   'caja 6 kg',    '🍐', 'from-lime-200 to-green-400',    NULL, true,  false, 3),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 'Fresas de Huelva',         'Fresas grandes, rojas, dulces. Temporada alta.',     12,   'bandeja 2 kg', '🍓', 'from-pink-300 to-red-500',      NULL, true,  false, 4),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001', 'Uvas sin pepita',          'Racimo blanco, tersas y dulces.',                    14,   'caja 5 kg',    '🍇', 'from-purple-300 to-fuchsia-500', NULL, true,  false, 5),
  -- Verduras
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000002', 'Tomate pera',              'Para freír, salsa y conservas. Rojo y carnoso.',     15,   'caja 5 kg',    '🍅', 'from-red-300 to-rose-500',      NULL, true,  false, 6),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000002', 'Lechuga romana',           'Crujiente, fresca, recién cogida.',                   8,   '6 unidades',   '🥬', 'from-lime-300 to-emerald-500',  NULL, true,  false, 7),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000002', 'Pimiento rojo',            'Carnosos y dulces. Para asar o ensalada.',           14,   'caja 3 kg',    '🫑', 'from-red-400 to-orange-600',    NULL, true,  false, 8),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000002', 'Zanahorias',               'Zanahoria tierna, ideal para sofritos y cremas.',    10,   'saco 5 kg',    '🥕', 'from-orange-300 to-amber-500',  NULL, true,  false, 9),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000002', 'Calabacines',              'Pequeños, tiernos, para crema y plancha.',            9,   'caja 3 kg',    '🥒', 'from-emerald-300 to-green-600', NULL, true,  false, 10),
  -- Tropical
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000003', 'Plátanos de Canarias',     'Con manchitas — los más sabrosos.',                  14,   'caja 4 kg',    '🍌', 'from-yellow-200 to-amber-400',  NULL, true,  false, 11),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000003', 'Aguacates Hass',           'Maduros al punto, listos para hoy o mañana.',        24,   'caja 4 kg',    '🥑', 'from-emerald-400 to-green-700', NULL, true,  true,  12),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000003', 'Piña tropical',            'Ya madura, dulce y lista para cortar.',               5,   'pieza ~1.5 kg','🍍', 'from-yellow-300 to-amber-500',  NULL, true,  false, 13),
  -- Hortalizas
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000004', 'Cebolla dulce',            'Cebolla dulce de Fuentes. Sabor suave.',              8,   'saco 5 kg',    '🧅', 'from-amber-100 to-orange-300',  NULL, true,  false, 14),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000004', 'Ajos morados',             'Ajos morados de Las Pedroñeras. Calidad top.',        6,   '1 kg',         '🧄', 'from-stone-200 to-purple-300',  NULL, true,  false, 15),
  -- Tubérculos
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000005', 'Patatas Agria',            'Para freír o guiso, ideal para todo.',               12,   'saco 10 kg',   '🥔', 'from-amber-200 to-yellow-700',  NULL, true,  false, 16),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000005', 'Boniato',                  'Boniato dulce, para asar al horno.',                 13,   'caja 5 kg',    '🍠', 'from-orange-400 to-red-500',    NULL, false, false, 17)
ON CONFLICT (id) DO NOTHING;
