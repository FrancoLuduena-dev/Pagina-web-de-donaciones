import styles from "./como_funciona.module.css";

/**
 * Página informativa sobre el funcionamiento de la plataforma.
 * @returns Página "Cómo funciona".
 */
export default function ComoFuncionaPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Nuestra plataforma permite que cualquier persona pueda crear publicaciones de donaciones para ayudar a otros.</p>

          <p>Los usuarios pueden explorar distintas publicaciones, ver detalles de los objetos disponibles y solicitar aquello que necesiten.</p>

          <p>Cada publicación incluye información relevante como descripción, imágenes, estado y datos del donante.</p>

          <p>El objetivo es crear una comunidad solidaria donde las personas puedan reutilizar objetos y ayudar a quienes lo necesiten.</p>
        </div>
      </div>
    </main>
  );
}
