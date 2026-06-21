
import { tituloPagina } from "@/constants/site";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.titulo}>Sobre Nosotros</h1>

        <p className={styles.descripcion}>
          {tituloPagina} es una plataforma creada para facilitar la conexión
          entre personas que desean donar objetos en buen estado y quienes los
          necesitan. Nuestro objetivo es promover la reutilización de recursos,
          reducir el desperdicio y fomentar la solidaridad dentro de la
          comunidad.
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Nuestra Misión</h2>

          <p>
            Creemos que muchos objetos que ya no utilizamos pueden resultar de
            gran utilidad para otras personas. Por eso desarrollamos un espacio
            simple y accesible para publicar, buscar y gestionar donaciones.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Sobre el Proyecto</h2>

          <p>
            Esta aplicación fue desarrollada por estudiantes de la Tecnicatura
            Universitaria en Programación del Centro Universitario Vicente
            López, como parte del trabajo práctico de la materia Programación
            III.
          </p>

          <p>
            Durante su desarrollo aplicamos conocimientos de análisis, diseño e
            implementación de sistemas web utilizando tecnologías como
            TypeScript, Next.js, NestJS y PostgreSQL.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Nuestro Compromiso</h2>

          <p>
            Más allá del objetivo académico, buscamos construir una herramienta
            que genere un impacto positivo en la comunidad, promoviendo la
            colaboración entre personas y ofreciendo una alternativa sencilla
            para dar una segunda vida a objetos que aún pueden ser útiles.
          </p>
        </article>
      </section>
    </main>
  );
}