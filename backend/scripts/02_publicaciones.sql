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
  '6ad6f6f9-4e18-4284-9821-5e2719d267e3',
  '3e02505d-9971-4eb0-93f1-59089d3a043b',
  '452749b1-321e-4d9d-b796-878731ccc44c',
  '52be1e16-4744-448c-910e-7a8b56546ae2',
  'PENDIENTE',
  1,
  NOW(),
  NOW(),
  'Hola. Me estoy mudando y la cama me vendría muy bien. Si todavía está disponible, me gustaría solicitarla. ¡Muchas gracias!',
  NULL,
  NULL
),

(
  '0a7c2209-4421-4ba4-a1bc-1448339c61d6',
  '51a10ee6-ceb7-4530-8e96-2d730457b420',
  '452749b1-321e-4d9d-b796-878731ccc44c',
  '52be1e16-4744-448c-910e-7a8b56546ae2',
  'PENDIENTE',
  1,
  NOW(),
  NOW(),
  'Hola. Soy fanático de Messi y me encantaría poder conservar esa colección. Si sigue disponible, quisiera solicitarla.',
  NULL,
  NULL
),

(
  '72f4b72a-c2e7-4e0d-bae7-75e2182758ea',
  'e7a913ab-bf19-4634-8ee3-ac94efbb26c6',
  '52be1e16-4744-448c-910e-7a8b56546ae2',
  '452749b1-321e-4d9d-b796-878731ccc44c',
  'PENDIENTE',
  1,
  NOW(),
  NOW(),
  'Buenas. Tengo dos gatos y estas latas me serían de mucha ayuda. Si aún están disponibles, quisiera solicitarlas.',
  NULL,
  NULL
),

(
  '975df57b-caf1-4b84-9392-abc216620779',
  'f99a4a88-7ddb-44ba-832a-eff19e5a6f4d',
  '52be1e16-4744-448c-910e-7a8b56546ae2',
  '452749b1-321e-4d9d-b796-878731ccc44c',
  'PENDIENTE',
  1,
  NOW(),
  NOW(),
  'Hola. El jean es exactamente de mi talle y me sería muy útil. Si todavía está disponible, me gustaría solicitarlo.',
  NULL,
  NULL
)

ON CONFLICT (id) DO NOTHING;
