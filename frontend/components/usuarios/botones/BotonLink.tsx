import Link from "next/link";
import styles from "./BotonLink.module.css";

type BotonLinkProps = {
  href: string;
  texto: string;
};

/**
 * Botón de navegación que redirige a otra ruta.
 * @param href Ruta de destino del enlace.
 * @param texto Texto mostrado en el botón.
 * @returns Componente `Link` estilizado como botón.
 */
export default function BotonLink({ href, texto }: BotonLinkProps) {
  return (
    <Link href={href} className={styles.button}>
      {texto}
    </Link>
  );
}
