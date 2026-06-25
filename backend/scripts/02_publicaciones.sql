-- ===========================================================
-- SOLICITUDES
-- ===========================================================

INSERT INTO solicitudes (
  id,
  "publicacionId",
  "solicitanteId",
  "creadorPublicacionId",
  estado,
  version,
  "createdAt",
  "updatedAt",
  mensaje,
  "motivoRechazo",
  "motivoCancelacion"
)
VALUES

(
  '33333333-3333-3333-3333-333333333001',
  '22222222-2222-2222-2222-222222222004',
  '11111111-1111-1111-1111-111111111001',
  '11111111-1111-1111-1111-111111111002',
  'PENDIENTE',
  1,
  NOW(),
  NOW(),
  'Hola. Me estoy mudando y la cama me vendría muy bien. Si todavía está disponible, me gustaría solicitarla. ¡Muchas gracias!',
  NULL,
  NULL
),

(
  '33333333-3333-3333-3333-333333333002',
  '22222222-2222-2222-2222-222222222006',
  '11111111-1111-1111-1111-111111111001',
  '11111111-1111-1111-1111-111111111002',
  'PENDIENTE',
  1,
  NOW(),
  NOW(),
  'Hola. Soy fanático de Messi y me encantaría poder conservar esa colección. Si sigue disponible, quisiera solicitarla.',
  NULL,
  NULL
),

(
  '33333333-3333-3333-3333-333333333003',
  '22222222-2222-2222-2222-222222222002',
  '11111111-1111-1111-1111-111111111002',
  '11111111-1111-1111-1111-111111111001',
  'PENDIENTE',
  1,
  NOW(),
  NOW(),
  'Buenas. Tengo dos gatos y estas latas me serían de mucha ayuda. Si aún están disponibles, quisiera solicitarlas.',
  NULL,
  NULL
),

(
  '33333333-3333-3333-3333-333333333004',
  '22222222-2222-2222-2222-222222222003',
  '11111111-1111-1111-1111-111111111002',
  '11111111-1111-1111-1111-111111111001',
  'PENDIENTE',
  1,
  NOW(),
  NOW(),
  'Hola. El jean es exactamente de mi talle y me sería muy útil. Si todavía está disponible, me gustaría solicitarlo.',
  NULL,
  NULL
)

ON CONFLICT (id) DO NOTHING;