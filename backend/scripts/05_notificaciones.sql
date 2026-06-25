-- ===========================================================
-- NOTIFICACIONES
-- ===========================================================

INSERT INTO notificaciones (
  id,
  "destinatarioId",
  tipo,
  titulo,
  mensaje,
  "leidaEn",
  "solicitudId",
  "publicacionId",
  "denunciaId",
  "creadaEn"
)
VALUES

(
  '55555555-5555-5555-5555-555555555001',
  '11111111-1111-1111-1111-111111111002',
  'SOLICITUD_CREADA',
  'Nueva solicitud',
  'Recibiste una nueva solicitud para "Cama de dos plazas con colchón".',
  NULL,
  '33333333-3333-3333-3333-333333333001',
  NULL,
  NULL,
  NOW()
),

(
  '55555555-5555-5555-5555-555555555002',
  '11111111-1111-1111-1111-111111111002',
  'SOLICITUD_CREADA',
  'Nueva solicitud',
  'Recibiste una nueva solicitud para "Colección de camisetas de Lionel Messi".',
  NULL,
  '33333333-3333-3333-3333-333333333002',
  NULL,
  NULL,
  NOW()
),

(
  '55555555-5555-5555-5555-555555555003',
  '11111111-1111-1111-1111-111111111001',
  'SOLICITUD_CREADA',
  'Nueva solicitud',
  'Recibiste una nueva solicitud para "Latas de alimento para gatos".',
  NULL,
  '33333333-3333-3333-3333-333333333003',
  NULL,
  NULL,
  NOW()
),

(
  '55555555-5555-5555-5555-555555555004',
  '11111111-1111-1111-1111-111111111001',
  'SOLICITUD_CREADA',
  'Nueva solicitud',
  'Recibiste una nueva solicitud para "Jean de hombre talle 42".',
  NULL,
  '33333333-3333-3333-3333-333333333004',
  NULL,
  NULL,
  NOW()
)

ON CONFLICT (id) DO NOTHING;