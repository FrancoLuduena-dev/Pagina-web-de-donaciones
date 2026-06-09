# Notas para el Front End

(ctrl + p -  markdown open preview para verlo bien)
si el sitio da error probar correrlo como 
```
npx next dev --webpack
```

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

## Layout del sitio
aca esta la jerarquia de carpetas, para que sepan donde poner cada pagina (si una pagina esta entre parentesis o corchetes, ponerselos al generar la carpeta en el nombre)
 
- **app/** 
	- layout.tsx &emsp;&emsp;&emsp; (el layout global, afecta a todo)
	- **(publico/)**   &emsp;&emsp;&emsp;(carpeta para elementos sin logeo)
		- layout.tsx &emsp;&emsp;&emsp; (layout general de elementos publicos, unloggedNavbar , footer)
		- publico.module.css &emsp;&emsp;&emsp; (css de publico/layout.tsx)
		- page.tsx &emsp;&emsp;&emsp; (Landing page sin logeo)
		- home.module.css &emsp;&emsp;&emsp; (layout especifico del publico/page.tsx &emsp;&emsp; - _Falta mejorar el formato general de la pagina, esta muy abajo, tiene un scroll innecesario_)
			- **como_funciona/** 
				- page.tsx  &emsp;&emsp;&emsp; (_Falta agregar info correcta, lo genere rapido con chatgp, y darle formato_)
				- como_funciona.module.css  
	- **(autenticacion/)** &emsp;&emsp;&emsp; (carpeta general para elementos de autenticacion)
		- layout.tsx &emsp;&emsp;&emsp; (layour general de elementos de autenticacion: unloggedNavbar, sin footer)
		- autenticacion.module.css &emsp;&emsp;&emsp; (css de autenticacion/layout.tsx)
		- **login/**
			- page.tsx
			- login.module.css &emsp;&emsp;&emsp; (css especifico de login/page.tsx &emsp;&emsp; - _faltaria centrar verticalmente, tiene scroll innecesario_)
		- **register/**
			- page.tsx &emsp;&emsp; ( _No esta creado, solo esta el archivo vacio_)
			- register.module.css &emsp;&emsp;&emsp; (css especifico de register/)
	- **(aplicacion/)** &emsp;&emsp;&emsp; (carpeta general de elementos ya logeado) 
		- layout.tsx &emsp;&emsp;&emsp; (layout general de elementos ya logeados: Navbar, footer)
		- aplicacion.module.css &emsp;&emsp;&emsp; (css de aplicacion/layout.tsx)
		- **donaciones/** 
			- layout.tsx &emsp;&emsp;&emsp; (layout de pagina de donaciones general: &emsp;&emsp; - _hay que agrega sidebar de categorias y darle formato a todo_)
			- page.tsx &emsp;&emsp;&emsp; (el grid para tarjetas iria aca, porque no esta compartido con los subelementos)
			- donaciones.module.css (css de donaciones, grid de tarjetas)
				-**[categoria/]** &emsp;&emsp;&emsp; (esta ruta tiene los archivos para la seleccion de una categoria especifica )
					- page.tsx &emsp;&emsp;&emsp; (aca va la configuracion para que elija las categorias de busqueda)
			- **[id]/**
				- page.tsx &emsp;&emsp;&emsp; (page de las publicaicones especificas cargadas)
			- **crear/** &emsp;&emsp;&emsp; (carpeta para form de creacion de publicacion de donaciones)
				- page.tsx  
		- **usuario/** &emsp;&emsp;&emsp; (carpeta para elementos generales de perfil de usuario)
			- page.tsx  &emsp;&emsp;&emsp; (resumen perfil - publicaciones activas, notificaciones nuevas, links a partes del perfil)
			- **editar/** &emsp;&emsp;&emsp; (carpeta para form de edicion de usuario)
				- page.tsx
			- **publicaciones/** &emsp;&emsp;&emsp; (carpeta para pagina de publicaicones propias del usuario)
				- page.tsx
			- **notificaciones/** &emsp;&emsp;&emsp; (todas las notificaciones (solicitudes hcehas aprobadas o rechazadas))
				- page.tsx
			- **solicitudes/** &emsp;&emsp;&emsp; (solicitudes de tus publicaciones que recibis, con marcado de leido, filtro para notificaciones por publicacion)
	- **(general/)**
		- **about/**
			- page.tsx &emsp;&emsp;&emsp; 
		- **contacto/** 
		- layout.tsx
- **components** &emsp;&emsp;&emsp;&emsp; (aca van pedazos reutilizables de la aplicacion, como navbar, sidebar, footer)
	- Footer.tsx 
	- Navbar.tsx
	- unloggedNavbar.tsx
	- Sidebar.tsx &emsp;&emsp;&emsp;&emsp; (cambiar los emojis de categorias por imagenes de referencia) 
		
- **constants** &emsp;&emsp;&emsp;&emsp; (constantes a utilizar en la aplicacion)
	- site.ts &emsp;&emsp;&emsp; (constante con el nombre de la pagina para poder cambiarlo rapido en todos lados)
- **types** &emsp;&emsp;&emsp;&emsp; (aca van basicamente los enums seleccionables para busqueda y filtro)
	- CategoriaPublicacion.ts &emsp;&emsp;&emsp; (para usar el filtro del sidebar de donaciones)

las carpetas entre parentesis dejarlas con el parentesis, eso hace que no se vean en la barra de direcciones del sitio



## Links - que ids usar en las cosas asi funcionan con los navbars

Ok, como estoy haciendo el navbar antes de que se hagan las partes de la pagina,e les dejo aca lo que necesito que sean los paths de las partes cuando las hagan. (usen este sistema de carpetas, donde poner los page.tsx de cada cosa)

 - log in : /login 
 - registrarse a la pagina: /register
 - General de    publicaciones: /donaciones 
 - Como funciona el sitio: /como_funciona
 - Panel de usuario: /usuario
 - about us: /about
 - contact us: /contacto

## Como agregar componentes a una pagina
Los navbars y footers y esas cosas van a ir en el layout, asi que esto quedo deprecado

<!--
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
-->

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

