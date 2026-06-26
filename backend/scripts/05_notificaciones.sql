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
  '6dbcd909-d00e-4718-852e-a36b52390628',
  '52be1e16-4744-448c-910e-7a8b56546ae2',
  'SOLICITUD_CREADA',
  'Nueva solicitud',
  'Recibiste una nueva solicitud para "Cama de dos plazas con colchón".',
  NULL,
  '6ad6f6f9-4e18-4284-9821-5e2719d267e3',
  NULL,
  NULL,
  NOW()
),

(
  'bf4465e7-25e6-4a94-8728-3292190c787c',
  '52be1e16-4744-448c-910e-7a8b56546ae2',
  'SOLICITUD_CREADA',
  'Nueva solicitud',
  'Recibiste una nueva solicitud para "Colección de camisetas de Lionel Messi".',
  NULL,
  '0a7c2209-4421-4ba4-a1bc-1448339c61d6',
  NULL,
  NULL,
  NOW()
),

(
  '70bd2727-d9f1-40a4-b90b-2a405f8ee716',
  '452749b1-321e-4d9d-b796-878731ccc44c',
  'SOLICITUD_CREADA',
  'Nueva solicitud',
  'Recibiste una nueva solicitud para "Latas de alimento para gatos".',
  NULL,
  '72f4b72a-c2e7-4e0d-bae7-75e2182758ea',
  NULL,
  NULL,
  NOW()
),

(
  '2146e1a0-57fc-4d27-a1ba-7552d7965229',
  '452749b1-321e-4d9d-b796-878731ccc44c',
  'SOLICITUD_CREADA',
  'Nueva solicitud',
  'Recibiste una nueva solicitud para "Jean de hombre talle 42".',
  NULL,
  '975df57b-caf1-4b84-9392-abc216620779',
  NULL,
  NULL,
  NOW()
)

ON CONFLICT (id) DO NOTHING;
