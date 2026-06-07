import styles from "./TarjetaResumen.module.css";

type TarjetaResumenProps = {
  titulo: string;
  valor: number;
};

export default function TarjetaResumen({
  titulo,
  valor,
}: TarjetaResumenProps) {
  return (
    <article className={styles.card}>
      <h2>{titulo}</h2>
      <p className={styles.number}>{valor}</p>
    </article>
  );
}