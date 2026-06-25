-- ===========================================================
-- Seed de datos - Página Web de Donaciones
--
-- Usuarios:
--   usuario1@usuario.com
--   usuario2@usuario.com
--   moderador@mod.com
--   admin@admin.com
--
-- Todos utilizan la misma contraseña (hash bcrypt).
--
-- Este archivo puede ejecutarse múltiples veces gracias al
-- uso de ON CONFLICT (id) DO NOTHING.
-- ===========================================================

-- ===========================================================
-- USUARIOS
-- ===========================================================

INSERT INTO usuarios (
  id,
  "nombreCompleto",
  "nombreUsuario",
  correo,
  contrasenia,
  "numeroTelefono",
  rol,
  estado,
  "razonBloqueo",
  "cantidadPublicacionesBloqueadas",
  "creadoEn",
  "actualizadoEn",
  "bloqueadorId"
)
VALUES
(
  '11111111-1111-1111-1111-111111111001',
  'Usuario Uno',
  'usuario1',
  'usuario1@usuario.com',
  '$2b$10$9OV.2CA6iG9sr3zFKBJ4L.utXOgQi2MQHGA65t.YJaQ16FOL/l/d.',
  '1122334455',
  'usuarioNormal',
  'ACTIVO',
  NULL,
  0,
  NOW(),
  NOW(),
  NULL
),
(
  '11111111-1111-1111-1111-111111111002',
  'Usuario Dos',
  'usuario2',
  'usuario2@usuario.com',
  '$2b$10$9OV.2CA6iG9sr3zFKBJ4L.utXOgQi2MQHGA65t.YJaQ16FOL/l/d.',
  '1166778899',
  'usuarioNormal',
  'ACTIVO',
  NULL,
  0,
  NOW(),
  NOW(),
  NULL
),
(
  '11111111-1111-1111-1111-111111111003',
  'Usuario Moderador',
  'moderador',
  'moderador@mod.com',
  '$2b$10$9OV.2CA6iG9sr3zFKBJ4L.utXOgQi2MQHGA65t.YJaQ16FOL/l/d.',
  '1100001111',
  'usuarioModerador',
  'ACTIVO',
  NULL,
  0,
  NOW(),
  NOW(),
  NULL
),
(
  '11111111-1111-1111-1111-111111111004',
  'Administrador',
  'admin',
  'admin@admin.com',
  '$2b$10$9OV.2CA6iG9sr3zFKBJ4L.utXOgQi2MQHGA65t.YJaQ16FOL/l/d.',
  '1199998888',
  'usuarioAdministrador',
  'ACTIVO',
  NULL,
  0,
  NOW(),
  NOW(),
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================================
-- PUBLICACIONES
-- ===========================================================

INSERT INTO publicacion (
  id,
  "creadorId",
  titulo,
  descripcion,
  "categoriaId",
  "localidadId",
  condicion,
  "imagenUrls",
  estado,
  version,
  "createdAt",
  "updatedAt",
  "deletedAt"
)
VALUES

(
  '22222222-2222-2222-2222-222222222001',
  '11111111-1111-1111-1111-111111111001',
  'Campera de aviador talle L',
  'Dono campera tipo aviador talle L. Está en excelente estado, abriga mucho y ya no la utilizo. Actualmente se encuentra reservada.',
  '550e8400-e29b-41d4-a716-446655440001',
  '3bc85f82-80dd-4fbf-a6f5-52313d4a8158',
  'NUEVO',
  '[
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/BHC-Fliegerjacke.jpg/960px-BHC-Fliegerjacke.jpg"
  ]'::jsonb,
  'RESERVADA',
  1,
  NOW(),
  NOW(),
  NULL
),

(
  '22222222-2222-2222-2222-222222222002',
  '11111111-1111-1111-1111-111111111001',
  'Latas de alimento para gatos',
  'Dono varias latas de alimento húmedo para gatos. Se encuentran cerradas, en perfecto estado y dentro de la fecha de vencimiento.',
  '550e8400-e29b-41d4-a716-446655440003',
  '8e5d5f95-07cf-4d11-b94c-f3e2fb1d7c9c',
  'NUEVO',
  '[
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Kattmat-Cat_food-Katzenfutter-Nourriture_pour_chats_-_2022.jpg/1280px-Kattmat-Cat_food-Katzenfutter-Nourriture_pour_chats_-_2022.jpg"
  ]'::jsonb,
  'DISPONIBLE',
  1,
  NOW(),
  NOW(),
  NULL
),

(
  '22222222-2222-2222-2222-222222222003',
  '11111111-1111-1111-1111-111111111001',
  'Jean de hombre talle 42',
  'Jean de hombre en buen estado. No tiene roturas ni manchas y todavía puede seguir utilizándose por mucho tiempo.',
  '550e8400-e29b-41d4-a716-446655440001',
  '673fc2d7-cae8-4fdf-a9f4-a5b9f6126fe0',
  'USADO_BUENO',
  '[
    "https://upload.wikimedia.org/wikipedia/commons/d/d2/Jeans_for_men.jpg"
  ]'::jsonb,
  'DISPONIBLE',
  1,
  NOW(),
  NOW(),
  NULL
),

(
  '22222222-2222-2222-2222-222222222004',
  '11111111-1111-1111-1111-111111111002',
  'Cama de dos plazas con colchón',
  'Regalo cama de dos plazas con colchón incluido. Tiene algunos años de uso, pero se encuentra firme y lista para seguir utilizándose.',
  '550e8400-e29b-41d4-a716-446655440002',
  '54dc5c49-b23d-4f2f-a1c8-71d24d9c83a0',
  'USADO_REGULAR',
  '[
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Bed_in_hotel_room_5.jpg/1280px-Bed_in_hotel_room_5.jpg"
  ]'::jsonb,
  'DISPONIBLE',
  1,
  NOW(),
  NOW(),
  NULL
),

(
  '22222222-2222-2222-2222-222222222005',
  '11111111-1111-1111-1111-111111111002',
  'Set de pinceles para pintura',
  'Juego de pinceles de distintos tamaños para pintura artística. Ideales para estudiantes o aficionados que estén comenzando.',
  '550e8400-e29b-41d4-a716-446655440004',
  '3bc85f82-80dd-4fbf-a6f5-52313d4a8158',
  'USADO_BUENO',
  '[
    "https://upload.wikimedia.org/wikipedia/commons/3/39/Paintbrushes.jpg"
  ]'::jsonb,
  'DISPONIBLE',
  1,
  NOW(),
  NOW(),
  NULL
),

(
  '22222222-2222-2222-2222-222222222006',
  '11111111-1111-1111-1111-111111111002',
  'Colección de camisetas de Lionel Messi',
  'Dono colección de camisetas inspiradas en los distintos equipos donde jugó Lionel Messi. Incluye varias camisetas representativas de diferentes etapas de su carrera.',
  '550e8400-e29b-41d4-a716-446655440001',
  '673fc2d7-cae8-4fdf-a9f4-a5b9f6126fe0',
  'USADO_REGULAR',
  '[
    "https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Leo_messi_barce_2005.jpg/960px-Leo_messi_barce_2005.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/8/83/Lionel_Messi_31mar2007.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/37/Lionel_Messi_vs_Valladolid_3.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Lionel_Messi_NE_Revolution_Inter_Miami_7.9.25-055.jpg/960px-Lionel_Messi_NE_Revolution_Inter_Miami_7.9.25-055.jpg"
  ]'::jsonb,
  'DISPONIBLE',
  1,
  NOW(),
  NOW(),
  NULL
)

ON CONFLICT (id) DO NOTHING;