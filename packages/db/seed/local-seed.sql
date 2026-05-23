-- Local seed: Mercabana / Frutas del Mercat (subdomain: frutas)
-- Apply via: wrangler d1 execute mercabana --local --file=../../packages/db/seed/local-seed.sql

DELETE FROM products;
DELETE FROM categories;
DELETE FROM users;
DELETE FROM tenants;

INSERT INTO tenants (id, slug, name, tagline, whatsapp_number, address, delivery_hours, primary_color, primary_color_dark, emoji) VALUES
  ('ten_frutas', 'frutas', 'Frutas del Mercat', 'Mayorista de fruta y verdura · Mercabarna', '+34681873504', 'Mercabarna, Barcelona', 'Lunes a sábado · 8:00 — 14:00', '#2d5128', '#1f3b1c', '🍊');

INSERT INTO categories (id, tenant_id, slug, title, lead, icon, sort_order, active) VALUES
  ('cat_frutas',   'ten_frutas', 'frutas',   'Frutas de temporada', 'Recogidas en lonja a primera hora', '🍎', 1, 1),
  ('cat_verduras', 'ten_frutas', 'verduras', 'Verduras frescas',    'Calidad Mercabarna, todos los días', '🥬', 2, 1),
  ('cat_tropical', 'ten_frutas', 'tropical', 'Tropical',            'Producto maduro al punto',          '🥑', 3, 1);

INSERT INTO products (id, tenant_id, category_id, name, description, price, unit, emoji, gradient, available, highlighted, sort_order) VALUES
  ('p_naranjas-mesa',     'ten_frutas', 'cat_frutas',   'Naranjas de mesa',         'Dulces, jugosas, perfectas para comer al natural.', 18, 'caja 10 kg',  '🍊', 'from-orange-300 to-orange-500', 1, 1, 1),
  ('p_naranjas-zumo',     'ten_frutas', 'cat_frutas',   'Naranjas de zumo',         'Finas de piel, mucho líquido. Ideales para zumo diario.', 22, 'caja 15 kg', '🍊', 'from-amber-300 to-orange-500', 1, 0, 2),
  ('p_mandarinas',        'ten_frutas', 'cat_frutas',   'Mandarinas clemenvilla',   'Fáciles de pelar, dulces, sin pepitas.',           16, 'caja 8 kg',   '🍊', 'from-orange-200 to-amber-400',  1, 0, 3),
  ('p_limones',           'ten_frutas', 'cat_frutas',   'Limones',                  'Limones de zumo, piel fina y mucho jugo.',         12, 'caja 5 kg',   '🍋', 'from-yellow-200 to-yellow-400', 1, 0, 4),
  ('p_manzanas-fuji',     'ten_frutas', 'cat_frutas',   'Manzanas Fuji',            'Crujientes y dulces, las que más nos piden.',      18, 'caja 8 kg',   '🍎', 'from-rose-300 to-red-500',      1, 1, 5),
  ('p_manzanas-golden',   'ten_frutas', 'cat_frutas',   'Manzanas Golden',          'Suaves y dulces, perfectas para los peques.',      16, 'caja 8 kg',   '🍏', 'from-lime-200 to-green-400',    1, 0, 6),
  ('p_platanos-canarias', 'ten_frutas', 'cat_tropical', 'Plátanos de Canarias',     'De Canarias, con manchitas (los más sabrosos).',   14, 'caja 4 kg',   '🍌', 'from-yellow-200 to-amber-400',  1, 0, 7),
  ('p_aguacates-hass',    'ten_frutas', 'cat_tropical', 'Aguacates Hass',           'Maduros al punto, listos para comer hoy o mañana.', 24, 'caja 4 kg',  '🥑', 'from-emerald-400 to-green-700', 1, 1, 8),
  ('p_fresas',            'ten_frutas', 'cat_frutas',   'Fresas de Huelva',         'Fresas grandes, rojas, dulces. Temporada alta.',   12, 'bandeja 2 kg','🍓', 'from-pink-300 to-red-500',      1, 0, 9),
  ('p_sandia',            'ten_frutas', 'cat_frutas',   'Sandía sin pepitas',       'Pieza de 8 a 10 kg. Roja, dulce, fresca.',         12, 'pieza ~9 kg', '🍉', 'from-red-300 to-emerald-500',   1, 0, 10),
  ('p_melon-galia',       'ten_frutas', 'cat_frutas',   'Melón Galia',              'Pequeño, muy aromático y dulce.',                  6,  'pieza ~2 kg', '🍈', 'from-lime-200 to-yellow-300',   0, 0, 11),
  ('p_pina',              'ten_frutas', 'cat_tropical', 'Piña tropical',            'Ya madura, dulce, lista para cortar.',             5,  'pieza ~1.5 kg','🍍','from-yellow-300 to-amber-500',  1, 0, 12),
  ('p_tomate-pera',       'ten_frutas', 'cat_verduras', 'Tomate pera',              'Para freír y para conservas. Rojo, carnoso.',      15, 'caja 5 kg',   '🍅', 'from-red-300 to-rose-500',      1, 0, 13),
  ('p_tomate-raf',        'ten_frutas', 'cat_verduras', 'Tomate Raf',               'El tomate de ensalada por excelencia. Sabor intenso.', 18, 'caja 3 kg', '🍅', 'from-rose-400 to-red-700',      1, 1, 14),
  ('p_patatas',           'ten_frutas', 'cat_verduras', 'Patatas Agria',            'Para freír, para guiso. Ideal para todo.',         12, 'saco 10 kg',  '🥔', 'from-amber-200 to-yellow-700',  1, 0, 15),
  ('p_cebolla',           'ten_frutas', 'cat_verduras', 'Cebolla dulce',            'Cebolla dulce de Fuentes. Pica poco, sabor suave.', 8, 'saco 5 kg',   '🧅', 'from-amber-100 to-orange-300',  1, 0, 16),
  ('p_ajos',              'ten_frutas', 'cat_verduras', 'Ajos morados',             'Ajos morados de Las Pedroñeras. Calidad top.',     6,  '1 kg',        '🧄', 'from-stone-200 to-purple-300',  1, 0, 17),
  ('p_pimiento-rojo',     'ten_frutas', 'cat_verduras', 'Pimiento rojo',            'Carnosos y dulces. Para asar o ensalada.',         14, 'caja 3 kg',   '🫑', 'from-red-400 to-orange-600',    1, 0, 18),
  ('p_lechugas',          'ten_frutas', 'cat_verduras', 'Lechuga romana',           'Crujiente, fresca, recién cogida.',                8,  '6 unidades',  '🥬', 'from-lime-300 to-emerald-500',  1, 0, 19),
  ('p_calabacines',       'ten_frutas', 'cat_verduras', 'Calabacines',              'Pequeños, tiernos, perfectos para crema y plancha.', 9,'caja 3 kg',  '🥒', 'from-emerald-300 to-green-600', 1, 0, 20);
