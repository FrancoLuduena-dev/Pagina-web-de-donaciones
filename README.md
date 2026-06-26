
# Proyecto Pagina de donaciones
Esta pagina, hecha con typescript, utilizando Next.js, Nest.js y PostgreSQL. Este proyecto fue hecho para la materia de Programación III de la Técnicatura universitaria en Programacion - UTN por De Oto Marcelo, De Marte Melina, Leguizamon Tobías y Ludueña Franco.

El sitio web es una plataforma que conecta personas que desean donar objetos con quienes los necesitan.

El objetivo del proyecto es facilitar la reutilización de artículos en buen estado, promoviendo la solidaridad, reduciendo el desperdicio y fomentando una economía más sostenible.

Los usuarios pueden publicar objetos para donar, explorar publicaciones realizadas por otros miembros de la comunidad, realizar solicitudes y coordinar la entrega de manera simple y segura.


## Requisitos previos
* Node.js 22 o superior
* npm 10 o superior
* PostgreSQL

## Como Instalar
* Copiar los archivos del github
* en el root, para instalar las dependencias de frontend y backend hacer ejecutar 
```bash
npm install
```
 
* configuración de backend
    * Crear en el backend el archivo .env
    * Poner en el archivo .env

        DB_HOST=localhost

        DB_PORT=5432
    
        DB_USER=postgres
    
        DB_PASS= **[poner su password de instalacion de postgres]**
    
        DB_NAME=tp_donaciones
        
        JWT_SECRET=**[poner su propio JWT secret]**

* configuración de la base de datos
    * correr en root el script "npm run setup-db" o manualmente crear la base de datos en postgres con el nombre puesto en DB_NAME
    * Las tablas se crearán automáticamente al iniciar el backend por primera vez.

* Seed sql de la base de datos para pruebas
    * Una vez creada la base de datos, habiendo corrido aunque sea una vez el backend para que se generen las tablas y configuradas las variables de entorno de PostgreSQL (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` y `PGDATABASE`), ejecutar:
    ```
    npm run db:seed
    ```
    
    * Usuarios de prueba

| Usuario | Correo | Rol |
|----------|---------|-----|
| Usuario 1 | `usuario1@usuario.com` | Usuario |
| Usuario 2 | `usuario2@usuario.com` | Usuario |
| Moderador | `moderador@mod.com` | Moderador |
| Administrador | `admin@admin.com` | Administrador |

    **Contraseña para todos los usuarios:** `Admin123!`

    * El script insertará:
        * 4 usuarios
        * 6 publicaciones
        * 4 solicitudes pendientes
        * 3 denuncias pendientes
        * 4 notificaciones
    * Todos los registros utilizan UUIDs fijos para facilitar el desarrollo y las pruebas.

* Configuración del Frontend
    * crear el archivo .env.local
    * agregarle NEXT_PUBLIC_API_URL=http://localhost:3000

* Ejecutar la aplicacion completa
    * Desde la carpeta raíz ejecutar
    ```bash
    npm run dev
    ```

* Iniciar el frontend en modo desarollo
    * Desde la carpeta raíz ejecutar
    ```bash
    npm run dev:front
    ```
    * El frontend iniciará en http://localhost:3001

* Inicia el backend en modo desarrollo.
    * Desde la carpeta raíz ejecutar
    ```bash
    npm run dev:back
    ```
    * El backend iniciará en http://localhost:3000

## Características principales de la aplicación
* Publicación de artículos para donar.
* Búsqueda y filtrado de publicaciones.
* Solicitudes de donación entre usuarios.
* Gestión de publicaciones y solicitudes.
* Moderación de contenido y reportes.
* Administración de usuarios y categorías.

## Roles de usuario
### Visitante
Puede navegar el landing page, registrarse y logearse.

### Usuario registrado
Puede crear publicaciones, solicitar donaciones y gestionar sus solicitudes.

### Moderador
Puede revisar reportes y moderar contenido para garantizar el correcto funcionamiento de la plataforma.

### Administrador
Puede gestionar usuarios, categorías y configuraciones generales del sistema.

## Tecnologías utilizadas

### Frontend
* Next.js
* TypeScript
* CSS Modules

### Backend
* NestJS
* TypeORM
* PostgreSQL
* JWT Authentication

## Objetivo
El sitio busca construir una comunidad donde los objetos que ya no son necesarios para una persona puedan convertirse en recursos útiles para otra, facilitando el acceso a bienes, reduciendo residuos y promoviendo la colaboración entre usuarios.
