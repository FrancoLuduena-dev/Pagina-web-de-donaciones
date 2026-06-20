"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./Searchbar.module.css";

export default function Searchbar() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");

  const manejarBusqueda = () => {
    const texto = busqueda.trim();

    if (!texto) {
      router.push("/publicaciones");
      return;
    }

    router.push(`/publicaciones?q=${encodeURIComponent(texto)}`);

  };

  return (
    <form
      className={styles.searchbar}
      onSubmit={(e) => {
        e.preventDefault();
        manejarBusqueda();
      }}
    >
      <label htmlFor="busqueda" className={styles.labelOculto}>
        Buscar donaciones
      </label>

      <div className={styles.contenedorInput}>
        <input
          id="busqueda"
          type="search"
          placeholder="Buscar donaciones..."
          className={styles.input}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <button
          type="submit"
          className={styles.botonBuscar}
          aria-label="Buscar"
        >
          <img
            src="/icons/search.png"
            alt="Buscar"
            width={24}
            height={24}
            className={styles.iconoNormal}
          />

          <img
            src="/icons/search.png"
            alt=""
            width={24}
            height={24}
            className={styles.iconoHover}
          />
        </button>
      </div>
    </form>
  );
}
