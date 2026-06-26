# Procedimiento de Backup y Recuperación

> Documento asociado al requerimiento **RNF-005 — Disponibilidad y Recuperación**.

Este documento describe el procedimiento básico para respaldar y recuperar la
base de datos PostgreSQL de la plataforma de donaciones, así como los pasos para
reiniciar el servicio ante un fallo.

## Datos del entorno

| Parámetro        | Valor por defecto |
|------------------|-------------------|
| Motor            | PostgreSQL        |
| Host             | `localhost`       |
| Puerto           | `5432`            |
| Usuario          | `postgres`        |
| Base de datos    | `tp_donaciones`   |
| Backend (API)    | `http://localhost:3000` |

> Los valores reales se toman del archivo `backend/.env`
> (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`).

---

## 1. Backup (copia de seguridad)

Se utiliza la herramienta `pg_dump` incluida con PostgreSQL.

### Backup completo de la base

```bash
pg_dump -h localhost -p 5432 -U postgres -d tp_donaciones -F c -f backup_tp_donaciones.dump
```

- `-F c` genera un archivo en formato comprimido (custom), recomendado para
  restaurar con `pg_restore`.
- Se solicitará la contraseña del usuario (`DB_PASS`).

### Backup en formato SQL plano (alternativa legible)

```bash
pg_dump -h localhost -p 5432 -U postgres -d tp_donaciones -f backup_tp_donaciones.sql
```

### Recomendación de frecuencia

- Realizar un backup **antes de cada despliegue** o cambio de esquema.
- Para entorno de desarrollo/TP, un backup manual diario o por sesión de trabajo
  es suficiente.
- Guardar los archivos de backup fuera del repositorio (no versionarlos).

---

## 2. Recuperación (restauración)

### A partir de un backup en formato custom (`.dump`)

1. (Opcional) Recrear la base vacía si está corrupta:

```bash
dropdb -h localhost -p 5432 -U postgres tp_donaciones
createdb -h localhost -p 5432 -U postgres tp_donaciones
```

2. Restaurar el contenido:

```bash
pg_restore -h localhost -p 5432 -U postgres -d tp_donaciones --clean --if-exists backup_tp_donaciones.dump
```

### A partir de un backup en formato SQL plano (`.sql`)

```bash
psql -h localhost -p 5432 -U postgres -d tp_donaciones -f backup_tp_donaciones.sql
```

---

## 3. Reinicio del servicio ante un fallo

El backend está diseñado para reiniciarse sin pérdida de datos: las operaciones
críticas (aceptar/finalizar/cancelar solicitud, tomar/resolver denuncia) se
ejecutan dentro de **transacciones** y solo confirman (`commit`) una vez que los
datos están persistidos. Por lo tanto, un corte durante una operación deja la
base en el estado previo consistente, nunca a medias.

Pasos para reiniciar:

1. Verificar que PostgreSQL esté activo y acepte conexiones.
2. Levantar el backend nuevamente:

```bash
npm run dev:back
```

3. Al iniciar, TypeORM sincroniza el esquema (`synchronize: true`) y el servicio
   queda disponible en `http://localhost:3000`.
4. (Opcional) Re-cargar datos de prueba si la base fue recreada:

```bash
npm run db:seed
```

---

## 4. Datos de prueba (seed)

Para repoblar la base con datos de ejemplo (usuarios, publicaciones, solicitudes,
denuncias) se utiliza el script de seed. Es idempotente gracias a
`ON CONFLICT (id) DO NOTHING`, por lo que puede ejecutarse varias veces sin
duplicar registros:

```bash
npm run db:seed
```

---

## 5. Checklist de recuperación rápida

- [ ] PostgreSQL está corriendo y acepta conexiones en el puerto configurado.
- [ ] Existe un backup reciente (`pg_dump`).
- [ ] La base `tp_donaciones` existe (o se recreó con `createdb`).
- [ ] Se restauró el backup (`pg_restore` / `psql`).
- [ ] El backend levanta sin errores (`npm run dev:back`).
- [ ] La API responde en `http://localhost:3000/publicaciones`.
