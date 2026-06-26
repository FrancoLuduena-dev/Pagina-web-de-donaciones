import styles from "./TarjetaResumen.module.css";

type TarjetaResumenProps = {
  titulo: string;
  valor: number;
};

/**
 * Tarjeta de resumen para mostrar un dato clave de usuario.
 * @param titulo Texto del encabezado de la tarjeta.
 * @param valor Número que representa el valor del resumen.
 * @returns Componente visual con título y valor.
 */
export default function TarjetaResumen({ titulo, valor }: TarjetaResumenProps) {
  return (
    <article className={styles.card}>
      <h2>{titulo}</h2>
      <p className={styles.number}>{valor}</p>
    </article>
  );
}
