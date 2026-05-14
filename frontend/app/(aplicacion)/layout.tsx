import styles from "./aplicacion.module.css"
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function PublicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Navbar />

      {children}

      <Footer />
    </div>
  );
}