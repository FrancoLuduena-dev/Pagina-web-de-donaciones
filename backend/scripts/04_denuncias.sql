-- ===========================================================
-- DENUNCIAS
-- ===========================================================

INSERT INTO denuncias (
  id,
  "publicacionId",
  "denuncianteId",
  "creadorPublicacionId",
  motivo,
  comentario,
  estado,
  "moderadorAsignadoId",
  "tipoResolucion",
  "detalleResolucion",
  "fechaResolucion",
  version,
  "fechaCreacion",
  "fechaActualizacion"
)
VALUES

(
  '44444444-4444-4444-4444-444444444001',
  '22222222-2222-2222-2222-222222222004',
  '11111111-1111-1111-1111-111111111001',
  '11111111-1111-1111-1111-111111111002',
  'PUBLICACION_FALSA',
  'Creo haber visto esta misma publicación repetida anteriormente. Considero que debería revisarse para evitar publicaciones duplicadas.',
  'PENDIENTE',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),

(
  '44444444-4444-4444-4444-444444444002',
  '22222222-2222-2222-2222-222222222002',
  '11111111-1111-1111-1111-111111111002',
  '11111111-1111-1111-1111-111111111001',
  'CONTENIDO_INAPROPIADO',
  'La imagen no parece corresponder claramente con el artículo ofrecido. Solicito que un moderador pueda revisarla.',
  'PENDIENTE',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),

(
  '44444444-4444-4444-4444-444444444003',
  '22222222-2222-2222-2222-222222222003',
  '11111111-1111-1111-1111-111111111002',
  '11111111-1111-1111-1111-111111111001',
  'OTRO',
  'Considero que la descripción podría generar confusión sobre el estado real del artículo. Prefiero que un moderador la revise.',
  'PENDIENTE',
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
)

ON CONFLICT (id) DO NOTHING;