# Notas para el Front End

Chicos, aca dejo las notas para el frontend asi si hay un problema o necesitan una referencia, estan todas juntas. Cualquier cosa que necesiten agregar y que otros tengan  que verlos ponganlas aca

# Titulo del sitio

Como todavia no tiene titulo el sitio, cree una constante que sea para el titulo del sitio, asi que cualquier lugar que necesiten que aparezca el titulo del sitio, tienen que 

 - Poner el import de la constante
 ```typescript 
 import { tituloPagina } from "@/constants/site"; 
 ```

Poner la constante donde queremos que aparezca el titulo de la pagina
```typescript 
{tituloPagina}
 ```
 
esto, cuando pongamos un titulo real al sitio, solo hay que actualizar la constante y ya esta


## Links - que Paths usar en las cosas asi funcionan con los navbars

Ok, como estoy haciendo el navbar antes de que se hagan las partes de la pagina,e les dejo aca lo que necesito que sean los paths de las partes cuando las hagan. (usen este sistema de carpetas, donde poner los page.tsx de cada cosa)

 - log in : /login 
 - registrarse a la pagina: /register
 - General de    publicaciones: /donaciones 
 - Como funciona el sitio: /como_funciona
 - Panel de usuario: /usuario
 - about us: /about
 - contact us: /contact

## Como agregar componentes a una pagina

### Navbar
Primero e importante, revisar que en el page empiecen un <> (justo despues del return como primer elemento)
y termine con </> justo antes del parentesis del return.
Todos los elementos van adentro de este elemento padre, esto permite generar varios elementos a la vez con el codigo.
ok, agregamos el import del navbar

```typescript 
import Navbar from "@/components/Navbar";
 ```
y despues en el page, como el navbar va primer arriba dle todo, en la linea siguiente del <> ponemos
```typescript 
<Navbar />
 ```

### UnloggedNavbar

Este ya lo dejo yo agregado al home sin logear, al login y al register

### Footer

Para agregar el footer primero agregamos el import

```typescript 
import Footer from "@/components/Footer";
```

y despues agregamos el footer al final, justo antes del </>

```typescript 
<Footer />
```

## Guia de estilo y colores:
En el styles/global.css estan todos los colores que vamos a utilizar en la pagina. 
les dejo igual aca las variables
```css 
--color-primario: #0EA5A4;
--color-primario-hover: #0F766E;
--color-primario-highlight: #CCFBF1;
--color-secundario: #F59E0B;
--color-secundario-highlight: #FEF3C7;
--color-fondo: #FAFAF9;
--color-tarjeta: #FFFFFF;
--color-texto-principal: #292524;
--color-texto-secundario: #78716C;
--color-exito: #14B8A6;
--color-alertas: #DC2626;
--color-warning: #F59E0B;
--color-borde: #E7E5E4; 
 ```

