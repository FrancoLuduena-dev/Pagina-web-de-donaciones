"use client";

import styles from "./BuscadorUsuario.module.css";

type BuscadorUsuarioProps = {
  nombreUsuario: string;
  setNombreUsuario: (valor: string) => void;
  onBuscar: () => void;
};

export default function BuscadorUsuario({
  nombreUsuario,
  setNombreUsuario,
  onBuscar,
}: BuscadorUsuarioProps) {
  return (
    <form
      className={styles.formulario}
      onSubmit={(e) => {
        e.preventDefault();
        onBuscar();
      }}
    >
      <label htmlFor="usuario">
        Nombre de usuario
      </label>

      <input
        id="usuario"
        type="text"
        value={nombreUsuario}
        onChange={(e) =>
          setNombreUsuario(e.target.value)
        }
        placeholder="Buscar usuario..."
        className={styles.input}
      />

      <button
        type="submit"
        className={styles.botonPrimario}
      >
        Buscar usuario
      </button>
    </form>
  );
}