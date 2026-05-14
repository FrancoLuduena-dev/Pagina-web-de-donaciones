import UnloggedNavbar from "@/components/UnloggedNavbar";
import styles from "./autenticacion.module.css";

export default function PublicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <UnloggedNavbar />

      {children}

    </div>
  );
}