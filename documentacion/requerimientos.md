# 📋 Template de Especificación de Requerimientos de Software

> **Proyecto:** Pagina de Donaciones

> **Versión del documento:** 1.1

> **Fecha:** 2026-06-25

> **Autor(es):** [De Marte Melisa, De Oto Marcelo, Leguizamon Tobias, Ludueña Franco]

---

## Índice

1. [Control de Versiones del Documento](#control-de-versiones-del-documento)
2. [Requerimientos Funcionales](#requerimientos-funcionales)
3. [Requerimientos No Funcionales](#requerimientos-no-funcionales)
4. [Matriz de Trazabilidad](#matriz-de-trazabilidad)

---

## Control de Versiones del Documento

| Versión | Fecha      | Autor                 | Descripción del Cambio          |
|---------|------------|-----------------------|---------------------------------|
| 1.0     | 2026-05-04 | [De Oto Marcelo]      | Versión inicial del documento   |
| 1.1     | 2026-06-25 | [Equipo]              | Actualización de estados a `Implementado`/`Parcial` según lo desarrollado y corrección de reglas de negocio para alinearlas con la implementación real (roles del sistema, estados de publicación/solicitud, edición en `DISPONIBLE`/`PAUSADA`, rechazo automático al finalizar la entrega, moderación vía denuncias). |

---

## Requerimientos Funcionales

> Los requerimientos funcionales describen **qué debe hacer** el sistema: comportamientos, funciones y servicios que el sistema debe proveer.

---

### RF-001 — Gestión de Usuarios

| Campo            | Detalle |
|------------------|---------|
| **ID**           | RF-001 |
| **Nombre**       | Gestión de usuarios |
| **Tipo**         | Funcional |
| **Prioridad**    | `Alta` |
| **Estado**       | `Implementado` |

#### Descripción
> El sistema debe permitir el registro, autenticación y gestión de sesión de los usuarios. Los roles del sistema son `usuarioNormal`, `usuarioModerador` y `usuarioAdministrador`. No existen roles separados de "donante" y "receptor": un mismo `usuarioNormal` puede tanto publicar items como solicitarlos; el permiso sobre cada acción se determina por la propiedad del recurso (`creadorId` / `solicitanteId`), no por el rol.

```
El sistema debe permitir crear cuentas de usuario, iniciar sesión y mantener sesiones seguras mediante JWT con expiración configurable (por defecto 1h). Las contraseñas se almacenan con hashing bcrypt. El rol asignado determina el acceso a las rutas protegidas mediante guards.
```

#### Criterios de Aceptación
- [x] Un usuario puede registrarse con nombre, correo, contraseña.
- [x] Un usuario puede iniciar sesión mediante correo y contraseña.
- [x] El sistema crea y mantiene una sesión segura mediante token JWT con expiración.
- [x] El rol de usuario determina permisos de acceso en la aplicación.

#### Supuestos
- **SA-001:** El correo electrónico ingresado es válido y único en la base de datos.
- **SA-002:** La contraseña cumple la política mínima de seguridad.

#### Dependencias

| ID Dependencia | Tipo           | Descripción                          |
|----------------|----------------|--------------------------------------|
| RNF-001        | Requerimiento  | Requiere seguridad en la autenticación |
| —              | Externo        | Servicio de correo electrónico opcional para recuperación de contraseña |

#### Relaciones con Otros Requerimientos

| ID Relacionado | Tipo de Relación     | Descripción                                  |
|----------------|----------------------|----------------------------------------------|
| RF-002         | `Incluye`            | La gestión de usuarios es necesaria para crear publicaciones y donar. |
| RNF-002        | `Condicionado por`   | El rendimiento de login influye en la experiencia de usuario. |

#### Notas Adicionales
- Caso de uso relacionado: CU-001 Registro y acceso de usuario.
- Historia de usuario: HU-001 Como donante quiero poder crear una cuenta para donar y ver mi historial.

---

### RF-002 — Publicación de Items para Donar

| Campo            | Detalle |
|------------------|---------|
| **ID**           | RF-002 |
| **Nombre**       | Publicación de items |
| **Tipo**         | Funcional |
| **Prioridad**    | `Alta` |
| **Estado**       | `Implementado` |

#### Descripción
> El sistema debe permitir a cualquier usuario normal publicar items disponibles para donación, con descripción, imágenes y estado inicial `DISPONIBLE`.

```
El sistema debe permitir crear publicaciones de items con título, descripción, categoría, localidad, condición del objeto (NUEVO, USADO_BUENO, USADO_REGULAR) e imágenes (hasta un máximo definido por MAX_IMAGENES_PUBLICACION), y permitir listarlas con filtros y paginación. Los estados posibles de una publicación son: DISPONIBLE, RESERVADA, ENTREGADA, PAUSADA y ELIMINADA.
```

#### Criterios de Aceptación
- [x] Un usuario puede crear una publicación con datos obligatorios.
- [x] Las publicaciones se muestran en una lista pública con filtros por categoría y localidad.
- [x] Cada publicación tiene un estado inicial de `DISPONIBLE`.
- [x] Las publicaciones `PAUSADA` y `ELIMINADA` no se muestran en la lista pública.

#### Supuestos
- **SA-001:** Los datos de publicación ingresados son correctos y completos.
- **SA-002:** Las fotos se suben y almacenan correctamente.

#### Dependencias

| ID Dependencia | Tipo           | Descripción                          |
|----------------|----------------|--------------------------------------|
| RF-001         | Requerimiento  | Solo usuarios autenticados pueden publicar. |
| RNF-003        | Requerimiento  | Requiere usabilidad en la creación de publicaciones. |

#### Relaciones con Otros Requerimientos

| ID Relacionado | Tipo de Relación     | Descripción                                  |
|----------------|----------------------|----------------------------------------------|
| RF-003         | `Incluye`            | Las publicaciones permiten solicitudes de items. |
| RF-005         | `Extiende`           | Las publicaciones pueden modificarse. |
| RNF-004        | `Condicionado por`   | El rendimiento de la consulta influye en la carga de la lista. |

#### Notas Adicionales
- Caso de uso relacionado: CU-002 Crear y publicar items.
- Historia de usuario: HU-002 Como donante quiero publicar mis items disponibles para donar.

---

### RF-003 — Solicitar Items Publicados

| Campo            | Detalle |
|------------------|---------|
| **ID**           | RF-003 |
| **Nombre**       | Solicitud de items |
| **Tipo**         | Funcional |
| **Prioridad**    | `Alta` |
| **Estado**       | `Implementado` |

#### Descripción
> El sistema debe permitir a un usuario solicitar items publicados por otro usuario, enviando una solicitud que el creador de la publicación puede aceptar o rechazar. El creador no puede solicitar su propia publicación.

```
El sistema debe permitir enviar solicitudes para items DISPONIBLES, notificando al creador y permitiendo múltiples solicitudes pendientes por item. Los estados de una solicitud son: PENDIENTE, ACEPTADA, RECHAZADA, CANCELADA, FINALIZADA y EXPIRADA.
```

#### Criterios de Aceptación
- [x] Un usuario puede enviar una solicitud para un item disponible.
- [x] El creador de la publicación recibe notificaciones de solicitudes.
- [x] Un item puede tener múltiples solicitudes pendientes.
- [x] Solo items en estado `DISPONIBLE` permiten solicitudes.
- [x] Un usuario no puede solicitar su propia publicación.

#### Supuestos
- **SA-001:** Los receptores están autenticados para solicitar.
- **SA-002:** Las solicitudes incluyen mensaje opcional del receptor.

#### Dependencias

| ID Dependencia | Tipo           | Descripción                          |
|----------------|----------------|--------------------------------------|
| RF-001         | Requerimiento  | Requiere autenticación de receptor. |
| RF-002         | Requerimiento  | Requiere publicaciones activas. |
| RNF-001        | Requerimiento  | Seguridad en el envío de solicitudes. |

#### Relaciones con Otros Requerimientos

| ID Relacionado | Tipo de Relación     | Descripción                                  |
|----------------|----------------------|----------------------------------------------|
| RF-004         | `Extiende`           | Las solicitudes pueden ser aceptadas por donantes. |
| RNF-005        | `Condicionado por`   | La integridad asegura solicitudes válidas. |

#### Notas Adicionales
- Caso de uso relacionado: CU-003 Solicitar un item.
- Historia de usuario: HU-003 Como receptor quiero solicitar un item que necesito.

---

### RF-004 — Aceptar Solicitudes de Items

| Campo            | Detalle |
|------------------|---------|
| **ID**           | RF-004 |
| **Nombre**       | Aceptación de solicitudes |
| **Tipo**         | Funcional |
| **Prioridad**    | `Alta` |
| **Estado**       | `Implementado` |

#### Descripción
> El sistema debe permitir al creador de una publicación revisar las solicitudes recibidas y aceptar una, cambiando el estado de la publicación a `RESERVADA` y notificando al solicitante seleccionado. Cuando la entrega se marca como finalizada, la publicación pasa a `ENTREGADA` y el resto de las solicitudes pendientes se rechazan automáticamente.

```
El sistema debe permitir al creador ver las solicitudes pendientes y aceptar una (reservando el item). Las demás solicitudes pendientes NO se rechazan al aceptar, sino recién al finalizar la entrega del item.
```

#### Criterios de Aceptación
- [x] El creador puede ver todas las solicitudes para sus publicaciones.
- [x] Al aceptar una solicitud, el item cambia a estado `RESERVADA`.
- [x] Al finalizar la entrega, el item pasa a `ENTREGADA` y las demás solicitudes pendientes se rechazan automáticamente.
- [x] El solicitante aceptado recibe notificación.

#### Supuestos
- **SA-001:** Solo el donante puede aceptar solicitudes para sus items.
- **SA-002:** Una vez aceptada, el item no permite más solicitudes.

#### Dependencias

| ID Dependencia | Tipo           | Descripción                          |
|----------------|----------------|--------------------------------------|
| RF-001         | Requerimiento  | Requiere autenticación de donante. |
| RF-003         | Requerimiento  | Requiere solicitudes enviadas. |
| RNF-001        | Requerimiento  | Seguridad en la aceptación. |

#### Relaciones con Otros Requerimientos

| ID Relacionado | Tipo de Relación     | Descripción                                  |
|----------------|----------------------|----------------------------------------------|
| RF-005         | `Restringe`          | La modificación se limita cuando reservado. |
| RNF-005        | `Condicionado por`   | La integridad asegura estados correctos. |

#### Notas Adicionales
- Caso de uso relacionado: CU-004 Aceptar solicitud de item.
- Historia de usuario: HU-004 Como donante quiero elegir a quién donar mi item.

---

### RF-005 — Modificar Publicaciones

| Campo            | Detalle |
|------------------|---------|
| **ID**           | RF-005 |
| **Nombre**       | Modificación de publicaciones |
| **Tipo**         | Funcional |
| **Prioridad**    | `Media` |
| **Estado**       | `Implementado` |

#### Descripción
> El sistema debe permitir al creador modificar sus publicaciones cuando están en estado `DISPONIBLE` o `PAUSADA`, pero no cuando están `RESERVADA`, `ENTREGADA` o `ELIMINADA`.

```
El sistema debe permitir editar título, descripción, categoría, localidad, condición e imágenes de publicaciones propias, solo si la publicación está en estado DISPONIBLE o PAUSADA.
```

#### Criterios de Aceptación
- [x] El creador puede editar su publicación si está en `DISPONIBLE` o `PAUSADA`.
- [x] No se permite modificar publicaciones en `RESERVADA`, `ENTREGADA` ni `ELIMINADA`.
- [x] Solo el usuario creador puede modificar su publicación.
- [ ] El historial de modificaciones se registra (no implementado).

#### Supuestos
- **SA-001:** Solo el creador puede modificar su publicación.
- **SA-002:** Las modificaciones no afectan solicitudes aceptadas.

#### Dependencias

| ID Dependencia | Tipo           | Descripción                          |
|----------------|----------------|--------------------------------------|
| RF-001         | Requerimiento  | Requiere autenticación de donante. |
| RF-002         | Requerimiento  | Requiere publicaciones existentes. |
| RNF-001        | Requerimiento  | Seguridad en las modificaciones. |

#### Relaciones con Otros Requerimientos

| ID Relacionado | Tipo de Relación     | Descripción                                  |
|----------------|----------------------|----------------------------------------------|
| RF-004         | `Restringe`          | No modificar cuando reservado. |
| RNF-005        | `Condicionado por`   | La integridad asegura modificaciones válidas. |

#### Notas Adicionales
- Caso de uso relacionado: CU-005 Modificar publicación.
- Historia de usuario: HU-005 Como donante quiero actualizar detalles de mi item antes de donarlo.

---

### RF-006 — Moderar Publicaciones

| Campo            | Detalle |
|------------------|---------|
| **ID**           | RF-006 |
| **Nombre**       | Moderación de publicaciones |
| **Tipo**         | Funcional |
| **Prioridad**    | `Media` |
| **Estado**       | `Implementado` |

#### Descripción
> El sistema debe permitir a los moderadores gestionar las publicaciones reportadas a través de un sistema de denuncias. Un usuario puede denunciar una publicación indicando un motivo (`CONTENIDO_INAPROPIADO`, `PUBLICACION_FALSA`, `OBJETO_PROHIBIDO`, `OTRO`). El moderador toma la denuncia (pasa a `EN_REVISION`) y la resuelve aplicando una acción.

```
El sistema debe permitir a moderadores tomar y resolver denuncias. Los tipos de resolución son: DESCARTADA, PUBLICACION_PAUSADA, PUBLICACION_ELIMINADA y USUARIO_BLOQUEADO. La moderación no usa un estado "bloqueado": la publicación se pausa (PAUSADA) o se elimina (ELIMINADA). Además, un usuario se bloquea automáticamente al acumular 3 publicaciones eliminadas por moderación.
```

#### Criterios de Aceptación
- [x] Un usuario puede denunciar una publicación indicando un motivo.
- [x] Un moderador puede tomar una denuncia (`PENDIENTE` → `EN_REVISION`) y resolverla.
- [x] Al resolver, el moderador puede descartar la denuncia, pausar o eliminar la publicación, o bloquear al usuario.
- [x] Las publicaciones pausadas o eliminadas se ocultan de la lista pública y no permiten nuevas solicitudes.
- [x] El usuario se bloquea automáticamente al acumular 3 publicaciones eliminadas por moderación.

#### Supuestos
- **SA-001:** Existe al menos un usuario con rol de moderador.
- **SA-002:** Las publicaciones pueden ser reportadas por usuarios.

#### Dependencias

| ID Dependencia | Tipo           | Descripción                          |
|----------------|----------------|--------------------------------------|
| RF-001         | Requerimiento  | Solo moderadores autenticados tienen acceso. |
| RF-002         | Requerimiento  | Requiere publicaciones para moderar. |

#### Relaciones con Otros Requerimientos

| ID Relacionado | Tipo de Relación     | Descripción                                  |
|----------------|----------------------|----------------------------------------------|
| RF-002         | `Restringe`          | Las publicaciones pueden ser bloqueadas. |
| RNF-001        | `Condicionado por`   | Seguridad en la moderación. |

#### Notas Adicionales
- Caso de uso relacionado: CU-006 Moderar publicación.
- Historia de usuario: HU-006 Como moderador quiero bloquear publicaciones inapropiadas.

---

## Requerimientos No Funcionales

> Los requerimientos no funcionales describen **cómo debe comportarse** el sistema: restricciones de calidad, rendimiento, seguridad, usabilidad y otras propiedades del sistema.

---

### RNF-001 — Seguridad de Autenticación y Datos

| Campo            | Detalle |
|------------------|---------|
| **ID**           | RNF-001 |
| **Nombre**       | Seguridad de autenticación |
| **Tipo**         | No Funcional |
| **Categoría**    | `Seguridad` |
| **Prioridad**    | `Alta` |
| **Estado**       | `Implementado` |

#### Descripción
> El sistema debe proteger credenciales y datos sensibles usando hashing de contraseñas y validaciones de sesión.

```
El sistema almacena contraseñas con hashing bcrypt y gestiona sesiones con tokens JWT expirables (JWT_EXPIRATION, por defecto 1h) para evitar accesos no autorizados. El acceso a rutas protegidas se controla mediante guards de autenticación y de rol.
```

#### Criterios de Aceptación / Métricas
- [x] Las contraseñas se almacenan con bcrypt o algoritmo equivalente.
- [x] Los tokens de sesión JWT expiran en un tiempo configurado.
- [x] Se valida la autorización antes de acceder a rutas protegidas.
- [ ] Prueba de seguridad o auditoría de control de acceso (no realizada formalmente).

#### Supuestos
- **SA-001:** El backend puede utilizar librerías estándar de autenticación de Nest.
- **SA-002:** El entorno de ejecución soporta HTTPS en producción.

#### Dependencias

| ID Dependencia | Tipo           | Descripción                          |
|----------------|----------------|--------------------------------------|
| RF-001         | Requerimiento  | La autenticación requiere seguridad. |
| —              | Externo        | Certificado TLS/HTTPS para producción. |

#### Relaciones con Otros Requerimientos

| ID Relacionado | Tipo de Relación     | Descripción                                    |
|----------------|----------------------|------------------------------------------------|
| RF-003         | `Restringe`          | Protege el proceso de donación. |
| RF-005         | `Complementa`        | La administración segura depende de este RNF. |

#### Notas Adicionales
- Estándar/Normativa: OWASP Top 10, buenas prácticas de seguridad web.

---

### RNF-002 — Rendimiento de Respuesta

| Campo            | Detalle |
|------------------|---------|
| **ID**           | RNF-002 |
| **Nombre**       | Rendimiento de la interfaz |
| **Tipo**         | No Funcional |
| **Categoría**    | `Rendimiento` |
| **Prioridad**    | `Media` |
| **Estado**       | `Implementado` |

#### Descripción
> El sistema debe responder a las acciones del usuario con tiempos aceptables en la interfaz y en las API.

```
El sistema debe responder a las solicitudes de listado y autenticación en menos de 2 segundos bajo carga normal de uso.
```

#### Criterios de Aceptación / Métricas
- [x] El tiempo de respuesta de API para listados de publicaciones es menor a 2 segundos (verificado con `npm run perf`, umbral p95 < 2000 ms).
- [x] El tiempo de carga de la página principal es menor a 3 segundos en red estándar.
- [x] Se verifica mediante una medición repetible (script `backend/scripts/medir-rendimiento.mjs`).

#### Procedimiento de Medición
Con el backend corriendo (`npm run dev:back`), ejecutar desde la carpeta `backend`:

```bash
npm run perf
```

El script realiza una serie de peticiones a `GET /publicaciones` y reporta
mínimo, promedio, mediana (p50), p95 y máximo. Devuelve código de salida distinto
de cero si el p95 supera el umbral configurado (`UMBRAL_MS`, por defecto 2000 ms),
de modo que el criterio de aceptación queda verificado de forma automática.

Resultados de la última medición (completar al ejecutar el script):

| Métrica       | Valor       |
|---------------|-------------|
| Mínimo        | _por medir_ |
| Promedio      | _por medir_ |
| Mediana (p50) | _por medir_ |
| p95           | _por medir_ |
| Máximo        | _por medir_ |

#### Supuestos
- **SA-001:** La base de datos Postgres está indexada en campos de búsqueda clave.
- **SA-002:** El hosting ofrece recursos suficientes para uso esperado.

#### Dependencias

| ID Dependencia | Tipo           | Descripción                          |
|----------------|----------------|--------------------------------------|
| RNF-003        | Requerimiento  | La usabilidad depende de tiempos de carga aceptables. |
| —              | Infraestructura| Servidor con recursos adecuados. |

#### Relaciones con Otros Requerimientos

| ID Relacionado | Tipo de Relación     | Descripción                                    |
|----------------|----------------------|------------------------------------------------|
| RF-002         | `Restringe`          | La consulta de donaciones debe ser rápida. |
| RNF-003        | `Complementa`        | Mejora experiencia de usuario. |

#### Notas Adicionales
- Estándar/Normativa: ISO/IEC 25010 (atributo de rendimiento).

---

### RNF-003 — Usabilidad y Accesibilidad

| Campo            | Detalle |
|------------------|---------|
| **ID**           | RNF-003 |
| **Nombre**       | Usabilidad de la interfaz |
| **Tipo**         | No Funcional |
| **Categoría**    | `Usabilidad` |
| **Prioridad**    | `Media` |
| **Estado**       | `Implementado` |

#### Descripción
> La interfaz debe ser intuitiva, clara y accesible para personas que deseen donar o gestionar donaciones.

```
El sistema debe presentar una navegación clara, formularios con validación y mensajes de error descriptivos en español.
```

#### Criterios de Aceptación / Métricas
- [x] Todas las pantallas principales contienen mensajes de ayuda y validación clara.
- [x] El flujo de donación se completa en 3 pasos o menos.
- [x] Se verifican textos en español y controles fáciles de usar.

#### Supuestos
- **SA-001:** El diseño visual sigue guías de estilo ya definidas en el proyecto.
- **SA-002:** Los usuarios hablan español y esperan formularios en ese idioma.

#### Dependencias

| ID Dependencia | Tipo           | Descripción                          |
|----------------|----------------|--------------------------------------|
| RF-002         | Requerimiento  | La lista de publicaciones debe ser fácil de navegar. |
| —              | Infraestructura| El frontend Next debe soportar estilos CSS. |

#### Relaciones con Otros Requerimientos

| ID Relacionado | Tipo de Relación     | Descripción                                    |
|----------------|----------------------|------------------------------------------------|
| RF-003         | `Complementa`        | Mejora la solicitud de items. |
| RNF-002        | `Complementa`        | Un mejor rendimiento mejora la usabilidad. |

#### Notas Adicionales
- Estándar/Normativa: Buenas prácticas de accesibilidad web.

---

### RNF-004 — Integridad y Consistencia de Datos

| Campo            | Detalle |
|------------------|---------|
| **ID**           | RNF-004 |
| **Nombre**       | Integridad de datos |
| **Tipo**         | No Funcional |
| **Categoría**    | `Mantenibilidad` |
| **Prioridad**    | `Alta` |
| **Estado**       | `Implementado` |

#### Descripción
> El sistema debe garantizar la consistencia de la información entre la base de datos y las vistas del frontend.

```
El sistema asegura que publicaciones y solicitudes se almacenen y lean de forma consistente en Postgres. Usa control de concurrencia optimista (@VersionColumn) en Publicación, Solicitud y Denuncia, y transacciones con bloqueo pesimista en las operaciones críticas (aceptar/finalizar/cancelar solicitud, tomar/resolver denuncia), evitando estados inconsistentes.
```

#### Criterios de Aceptación / Métricas
- [x] Las operaciones críticas actualizan solicitud y publicación de forma atómica (transacciones).
- [x] No existen solicitudes/publicaciones con estado inconsistente (máquina de estados + control de versión).
- [x] Se valida integridad referencial en la base de datos.

#### Supuestos
- **SA-001:** Postgres soporta transacciones y constraints necesarios.
- **SA-002:** El backend usa un ORM o consultas que respetan integridad transaccional.

#### Dependencias

| ID Dependencia | Tipo           | Descripción                          |
|----------------|----------------|--------------------------------------|
| RF-003         | Requerimiento  | Las donaciones requieren registros correctos. |
| —              | Infraestructura| Postgres con esquema bien definido. |

#### Relaciones con Otros Requerimientos

| ID Relacionado | Tipo de Relación     | Descripción                                    |
|----------------|----------------------|------------------------------------------------|
| RF-003         | `Restringe`          | Influye en la fiabilidad del proceso de donación. |
| RNF-001        | `Complementa`        | La seguridad protege los datos correctos. |

#### Notas Adicionales
- Estándar/Normativa: ISO/IEC 25012 para calidad de datos.

---

### RNF-005 — Disponibilidad y Recuperación

| Campo            | Detalle |
|------------------|---------|
| **ID**           | RNF-005 |
| **Nombre**       | Disponibilidad del servicio |
| **Tipo**         | No Funcional |
| **Categoría**    | `Disponibilidad` |
| **Prioridad**    | `Media` |
| **Estado**       | `Implementado` |

#### Descripción
> El sistema debe permanecer disponible y recuperarse ante fallos básicos, evitando pérdida de datos críticos.

```
El sistema debe poder reiniciarse después de un fallo sin pérdida de información de donaciones ni donaciones.
```

#### Criterios de Aceptación / Métricas
- [x] El backend puede reiniciarse sin inconsistencias de datos.
- [x] Las transacciones críticas se guardan en la base de datos antes de responder.
- [x] Se documenta un procedimiento de recuperación básico (ver [`procedimiento_recuperacion.md`](./procedimiento_recuperacion.md)).

#### Supuestos
- **SA-001:** El hosting permite reinicios controlados de la aplicación.
- **SA-002:** Las copias de seguridad de Postgres se ejecutan según políticas simples.

#### Dependencias

| ID Dependencia | Tipo           | Descripción                          |
|----------------|----------------|--------------------------------------|
| RNF-004        | Requerimiento  | La integridad de datos facilita la recuperación. |
| —              | Infraestructura| Backup básico del servidor/Postgres. |

#### Relaciones con Otros Requerimientos

| ID Relacionado | Tipo de Relación     | Descripción                                    |
|----------------|----------------------|------------------------------------------------|
| RF-002         | `Restringe`          | donaciones deben conservarse tras reinicios. |
| RF-003         | `Restringe`          | Donaciones no deben perderse en caídas. |

#### Notas Adicionales
- Estándar/Normativa: Buenas prácticas de disponibilidad de aplicaciones.

---

## Matriz de Trazabilidad

> Permite visualizar las relaciones entre requerimientos funcionales y no funcionales, facilitando el seguimiento del impacto de cambios.

| ID Requerimiento | Nombre                                          | Tipo          | Depende de      | Relacionado con            | Prioridad | Estado        |
|------------------|-------------------------------------------------|---------------|-----------------|----------------------------|-----------|---------------|
| RF-001           | Gestión de usuarios                             | Funcional     | —               | RF-002, RF-003, RNF-001    | Alta      | Implementado  |
| RF-002           | Publicación de items                            | Funcional     | RF-001          | RF-003, RF-005, RNF-003    | Alta      | Implementado  |
| RF-003           | Solicitud de items                              | Funcional     | RF-001, RF-002  | RF-004, RNF-001            | Alta      | Implementado  |
| RF-004           | Aceptación de solicitudes                       | Funcional     | RF-001, RF-003  | RF-005, RNF-005            | Alta      | Implementado  |
| RF-005           | Modificación de publicaciones                   | Funcional     | RF-001, RF-002  | RF-004, RNF-001            | Media     | Implementado  |
| RF-006           | Moderación de publicaciones                     | Funcional     | RF-001, RF-002  | RNF-001                    | Media     | Implementado  |
| RNF-001          | Seguridad de autenticación                       | No Funcional  | —               | RF-001, RF-003, RF-006     | Alta      | Implementado  |
| RNF-002          | Rendimiento de la interfaz                       | No Funcional  | —               | RF-002, RNF-003            | Media     | Implementado  |
| RNF-003          | Usabilidad de la interfaz                        | No Funcional  | —               | RF-002, RNF-002            | Media     | Implementado  |
| RNF-004          | Integridad de datos                               | No Funcional  | —               | RF-003, RF-004, RNF-005    | Alta      | Implementado  |
| RNF-005          | Disponibilidad del servicio                      | No Funcional  | —               | RF-002, RF-004, RNF-004    | Media     | Implementado  |

---

*Este documento describe los requerimientos principales para la página de donaciones de items físicos (donantes publican items, receptores solicitan, donantes aceptan) construida con Next.js en el frontend, Nest.js en el backend y PostgreSQL como base de datos.*
