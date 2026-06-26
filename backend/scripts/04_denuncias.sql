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
  '2dee4d35-5f50-4c76-b336-3eaa5fe1425e',
  '3e02505d-9971-4eb0-93f1-59089d3a043b',
  '452749b1-321e-4d9d-b796-878731ccc44c',
  '52be1e16-4744-448c-910e-7a8b56546ae2',
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
  'a8742796-98d2-4c4a-a7a2-94582f787b55',
  'e7a913ab-bf19-4634-8ee3-ac94efbb26c6',
  '52be1e16-4744-448c-910e-7a8b56546ae2',
  '452749b1-321e-4d9d-b796-878731ccc44c',
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
  'c5f66934-e670-4e74-800c-417086f5d2ff',
  'f99a4a88-7ddb-44ba-832a-eff19e5a6f4d',
  '52be1e16-4744-448c-910e-7a8b56546ae2',
  '452749b1-321e-4d9d-b796-878731ccc44c',
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
