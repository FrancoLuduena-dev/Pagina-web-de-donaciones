# Backend - Página de Donaciones

Backend de la plataforma de donaciones desarrollado con NestJS, TypeORM y PostgreSQL.

## Tecnologías utilizadas

* NestJS
* TypeORM
* PostgreSQL
* JWT Authentication

## Configuración

Crear un archivo `.env` en la carpeta backend:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=[password]
DB_NAME=tp_donaciones

JWT_SECRET=test123
```

## Base de datos

Crear la base de datos o ejecutar:

```bash
npm run setup-db
```

Las tablas se crearán automáticamente al iniciar el backend.

## Instalación

Desde la carpeta raíz del proyecto:

```bash
npm install
```

## Ejecución

Iniciar únicamente el backend:

```bash
npm run dev:back
```

El servidor estará disponible en:

```txt
http://localhost:3000
```

## Funcionalidades

* Gestión de usuarios y autenticación.
* Gestión de publicaciones.
* Gestión de solicitudes.
* Sistema de denuncias y moderación.
* Administración de categorías.
* API REST para el frontend.
