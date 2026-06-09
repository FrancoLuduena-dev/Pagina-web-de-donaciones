import Link from "next/link";
import styles from "./BotonLink.module.css";

type BotonLinkProps = {
  href: string;
  texto: string;
};

export default function BotonLink({
  href,
  texto,
}: BotonLinkProps) {
  return (
    <Link href={href} className={styles.button}>
      {texto}
    </Link>
  );
}