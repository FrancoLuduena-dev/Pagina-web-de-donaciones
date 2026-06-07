# 📋 Template de Especificación de Requerimientos de Software

> **Proyecto:** Pagina de Donaciones

> **Versión del documento:** 1.0

> **Fecha:** 2026-05-04

> **Autor(es):** [De Marte Melisa, De Oto Marcelo, Leguizamon Tobias, Ludueña Franco]

> **Estado:** `Borrador`

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
| **Estado**       | `Pendiente` |

#### Descripción
> El sistema debe permitir el registro, autenticación y gestión de sesión de los usuarios, diferenciando roles de donante, receptor y moderador.

```
El sistema debe permitir crear cuentas de usuario, iniciar sesión, cerrar sesión y mantener sesiones seguras con roles asignados.
```

#### Criterios de Aceptación
- [ ] Un usuario puede registrarse con nombre, correo, contraseña.
- [ ] Un usuario puede iniciar sesión mediante correo y contraseña.
- [ ] El sistema crea y mantiene una sesión segura hasta el cierre de sesión.
- [ ] El rol de usuario determina permisos de acceso en la aplicación.

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
| **Estado**       | `Pendiente` |

#### Descripción
> El sistema debe permitir a los donantes publicar items disponibles para donación, con descripción, fotos y estado inicial disponible.

```
El sistema debe permitir crear publicaciones de items con título, descripción, tipo de item (ropa, alimentos, muebles), fotos, ubicación y estado, y permitir listarlas por página.
```

#### Criterios de Aceptación
- [ ] Un donante puede crear una publicación con datos obligatorios.
- [ ] Las publicaciones se muestran en una lista pública con filtros por tipo y ubicación.
- [ ] Cada publicación tiene un estado inicial de "Disponible".
- [ ] Las publicaciones bloqueadas no se muestran.

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
| **Estado**       | `Pendiente` |

#### Descripción
> El sistema debe permitir a los receptores solicitar items publicados por donantes, enviando una solicitud que el donante puede aceptar o rechazar.

```
El sistema debe permitir a receptores enviar solicitudes para items disponibles, notificando al donante y permitiendo múltiples solicitudes por item.
```

#### Criterios de Aceptación
- [ ] Un receptor puede enviar una solicitud para un item disponible.
- [ ] El donante recibe notificaciones de solicitudes.
- [ ] Un item puede tener múltiples solicitudes pendientes.
- [ ] Solo items en estado "Disponible" permiten solicitudes.

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
| **Estado**       | `Pendiente` |

#### Descripción
> El sistema debe permitir a los donantes revisar solicitudes para sus publicaciones y aceptar una, cambiando el estado a reservado y notificando al receptor seleccionado.

```
El sistema debe permitir a donantes ver solicitudes pendientes, aceptar una (reservando el item), y rechazar otras automáticamente.
```

#### Criterios de Aceptación
- [ ] El donante puede ver todas las solicitudes para sus publicaciones.
- [ ] Al aceptar una solicitud, el item cambia a estado "Reservado".
- [ ] Otras solicitudes se rechazan automáticamente.
- [ ] El receptor aceptado recibe notificación.

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
| **Estado**       | `Pendiente` |

#### Descripción
> El sistema debe permitir a los donantes modificar sus publicaciones solo cuando están en estado disponible, no en reservado o entregado.

```
El sistema debe permitir editar título, descripción, fotos y otros detalles de publicaciones propias, pero solo si no han sido reservadas.
```

#### Criterios de Aceptación
- [ ] El donante puede editar su publicación si está en "Disponible".
- [ ] No se permite modificar publicaciones en "Reservado" o "Entregado".
- [ ] Los cambios se guardan y notifican a solicitantes si hay.
- [ ] El historial de modificaciones se registra opcionalmente.

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
| **Estado**       | `Pendiente` |

#### Descripción
> El sistema debe permitir a los moderadores bloquear publicaciones que violen las reglas, cambiando su estado a bloqueado.

```
El sistema debe permitir a moderadores revisar publicaciones reportadas o sospechosas y bloquearlas si es necesario.
```

#### Criterios de Aceptación
- [ ] Un moderador puede bloquear una publicación, ocultándola de la lista pública.
- [ ] Las publicaciones bloqueadas no permiten nuevas solicitudes.
- [ ] El donante recibe notificación del bloqueo.
- [ ] El historial de moderación se registra.

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
| **Estado**       | `Pendiente` |

#### Descripción
> El sistema debe proteger credenciales y datos sensibles usando cifrado, hashing de contraseñas y validaciones de sesión.

```
El sistema debe almacenar contraseñas con hashing seguro y gestionar sesiones con tokens expirables para evitar accesos no autorizados.
```

#### Criterios de Aceptación / Métricas
- [ ] Las contraseñas se almacenan con bcrypt o algoritmo equivalente.
- [ ] Los tokens de sesión JWT expiran en un tiempo configurado.
- [ ] Se valida la autorización antes de acceder a rutas protegidas.
- [ ] Prueba de seguridad o auditoría de control de acceso.

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
| **Estado**       | `Pendiente` |

#### Descripción
> El sistema debe responder a las acciones del usuario con tiempos aceptables en la interfaz y en las API.

```
El sistema debe responder a las solicitudes de listado y autenticación en menos de 2 segundos bajo carga normal de uso.
```

#### Criterios de Aceptación / Métricas
- [ ] El tiempo de respuesta de API para listados de publicaciones es menor a 2 segundos.
- [ ] El tiempo de carga de la página principal es menor a 3 segundos en red estándar.
- [ ] Se verifica mediante pruebas de carga básicas o mediciones de navegador.

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
| **Estado**       | `Pendiente` |

#### Descripción
> La interfaz debe ser intuitiva, clara y accesible para personas que deseen donar o gestionar donaciones.

```
El sistema debe presentar una navegación clara, formularios con validación y mensajes de error descriptivos en español.
```

#### Criterios de Aceptación / Métricas
- [ ] Todas las pantallas principales contienen mensajes de ayuda y validación clara.
- [ ] El flujo de donación se completa en 3 pasos o menos.
- [ ] Se verifican textos en español y controles fáciles de usar.

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
| **Estado**       | `Pendiente` |

#### Descripción
> El sistema debe garantizar la consistencia de la información entre la base de datos y las vistas del frontend.

```
El sistema debe asegurar que las donaciones y solicitudes se almacenen y lean de forma consistente en Postgres, evitando registros duplicados o descripciones incorrectas.
```

#### Criterios de Aceptación / Métricas
- [ ] Las transacciones de donación actualizan solicitud y registro de forma atómica.
- [ ] No existen donaciones pendientes con estado inconsistente.
- [ ] Se valida integridad referencial en la base de datos.

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
| **Estado**       | `Pendiente` |

#### Descripción
> El sistema debe permanecer disponible y recuperarse ante fallos básicos, evitando pérdida de datos críticos.

```
El sistema debe poder reiniciarse después de un fallo sin pérdida de información de donaciones ni donaciones.
```

#### Criterios de Aceptación / Métricas
- [ ] El backend puede reiniciarse sin inconsistencias de datos.
- [ ] Las transacciones críticas se guardan en la base de datos antes de responder.
- [ ] Se documenta un procedimiento de recuperación básico.

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
| RF-001           | Gestión de usuarios                             | Funcional     | —               | RF-002, RF-003, RNF-001    | Alta      | Pendiente     |
| RF-002           | Publicación de items                            | Funcional     | RF-001          | RF-003, RF-005, RNF-003    | Alta      | Pendiente     |
| RF-003           | Solicitud de items                              | Funcional     | RF-001, RF-002  | RF-004, RNF-001            | Alta      | Pendiente     |
| RF-004           | Aceptación de solicitudes                       | Funcional     | RF-001, RF-003  | RF-005, RNF-005            | Alta      | Pendiente     |
| RF-005           | Modificación de publicaciones                   | Funcional     | RF-001, RF-002  | RF-004, RNF-001            | Media     | Pendiente     |
| RF-006           | Moderación de publicaciones                     | Funcional     | RF-001, RF-002  | RNF-001                    | Media     | Pendiente     |
| RNF-001          | Seguridad de autenticación                       | No Funcional  | —               | RF-001, RF-003, RF-006     | Alta      | Pendiente     |
| RNF-002          | Rendimiento de la interfaz                       | No Funcional  | —               | RF-002, RNF-003            | Media     | Pendiente     |
| RNF-003          | Usabilidad de la interfaz                        | No Funcional  | —               | RF-002, RNF-002            | Media     | Pendiente     |
| RNF-004          | Integridad de datos                               | No Funcional  | —               | RF-003, RF-004, RNF-005    | Alta      | Pendiente     |
| RNF-005          | Disponibilidad del servicio                      | No Funcional  | —               | RF-002, RF-004, RNF-004    | Media     | Pendiente     |

---

*Este documento describe los requerimientos principales para la página de donaciones de items físicos (donantes publican items, receptores solicitan, donantes aceptan) construida con Next.js en el frontend, Nest.js en el backend y PostgreSQL como base de datos.*
