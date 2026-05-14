import Footer from "@/components/Footer";
import UnloggedNavbar from "@/components/UnloggedNavbar";
import styles from "./publico.module.css";

export default function PublicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <UnloggedNavbar />

      {children}

      <Footer />
    </div>
  );
}