"use client";

import { useState } from "react";
import styles from "./Searchbar.module.css";
// Use plain <img> to avoid next/image wrappers that may alter rendering

export default function Searchbar() {
  const [busqueda, setBusqueda] = useState("");

  const manejarBusqueda = () => {
    console.log("Buscar:", busqueda);

    /*
    Conexion real cuando este conectado front y back

    buscarPublicaciones(busqueda);
    */
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
            src="/icons/search_hover.png"
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
