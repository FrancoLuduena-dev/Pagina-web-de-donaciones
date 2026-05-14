import Sidebar from "@/components/Sidebar";
import styles from "./donaciones.module.css"

export default function PublicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Sidebar />

      {children}

    </div>
  );
}