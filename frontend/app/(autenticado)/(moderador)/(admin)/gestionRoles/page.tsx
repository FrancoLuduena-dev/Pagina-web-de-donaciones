"use client";

import { useState } from "react";
import styles from "./gestionRoles.module.css";
import { RolUsuario } from "@/types/RolUsuario";
import BuscadorUsuario from "@/components/moderacion/buscadorUsuario/Buscadorusuario";

type UsuarioEncontrado = {
  id: string;
  nombreCompleto: string;
  nombreUsuario: string;
  correo: string;
  rol: RolUsuario;
  estado: string;
};

const obtenerTextoRol = (rol: RolUsuario) => {
  switch (rol) {
    case RolUsuario.usuarioAdministrador:
      return "Administrador";
    case RolUsuario.usuarioModerador:
      return "Moderador";
    default:
      return "Usuario";
  }
};

export default function ModeracionPage() {
  const [nombreUsuario, setNombreUsuario] = useState("");

  const [usuario, setUsuario] = useState<UsuarioEncontrado | null>(null);

  const [rolSeleccionado, setRolSeleccionado] = useState<RolUsuario>(
    RolUsuario.usuarioNormal,
  );

  const [cargando, setCargando] = useState(false);

  const [mensaje, setMensaje] = useState("");

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const hayCambios = usuario !== null && usuario.rol !== rolSeleccionado;

  async function buscarUsuario() {
    try {
      setCargando(true);
      setMensaje("");

      /* Conexion real entre front y back */

      const token = localStorage.getItem("access_token");

      const respuesta = await fetch(`/api/usuarios/buscar/${nombreUsuario}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        console.log("STATUS:", respuesta.status);

        const texto = await respuesta.text();

        console.log("BODY:", texto);

        throw new Error();
      }

      const datos = await respuesta.json();

      setUsuario(datos);
      setRolSeleccionado(datos.rol);
    } catch (error) {
      console.error(error);

      setMensaje("No se encontró el usuario.");
      setUsuario(null);
    } finally {
      console.log("terminó búsqueda");
      setCargando(false);
    }
  }

  async function guardarCambios() {
    if (!usuario) {
      return;
    }

    try {
      
      const token = localStorage.getItem("access_token");

      const respuesta = await fetch(`/api/usuarios/${usuario.id}/rol`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rol: rolSeleccionado,
        }),
      });

      // TEST_DESCOMENTAR
      /* 
      if (!respuesta.ok) {
        throw new Error("No se pudo actualizar el rol");
      }
      */
      // END_TEST_DESCOMENTAR


      // MOCK_BORRAR
      if (!respuesta.ok) {
        console.log("STATUS:", respuesta.status);

        const texto = await respuesta.text();

        console.log("BODY:", texto);

        throw new Error("No se pudo actualizar el rol");
      }
      // END_MOCK_BORRAR

      setUsuario({
        ...usuario,
        rol: rolSeleccionado,
      });

      setMensaje("Rol actualizado correctamente.");
    } catch {
      setMensaje("No se pudo actualizar el rol.");
    }
  }

  return (
    <>
      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.card}>
            <h1 className={styles.title}>Gestión de roles</h1>

            <BuscadorUsuario
              nombreUsuario={nombreUsuario}
              setNombreUsuario={setNombreUsuario}
              onBuscar={buscarUsuario}
            />
          </section>

          {usuario && (
            <section className={styles.card}>
              <h2>Usuario encontrado</h2>

              <div className={styles.datosUsuario}>
                <p>
                  <strong>Nombre:</strong> {usuario.nombreCompleto}
                </p>

                <p>
                  <strong>Usuario:</strong> {usuario.nombreUsuario}
                </p>

                <p>
                  <strong>Correo:</strong> {usuario.correo}
                </p>

                <div className={styles.filaRol}>
                  <strong>Rol actual:</strong>

                  <span
                    className={`${styles.badgeRol} ${
                      usuario.rol === RolUsuario.usuarioAdministrador
                        ? styles.badgeAdministrador
                        : usuario.rol === RolUsuario.usuarioModerador
                          ? styles.badgeModerador
                          : styles.badgeUsuario
                    }`}
                  >
                    {obtenerTextoRol(usuario.rol)}
                  </span>
                </div>

                <p>
                  <strong>Estado:</strong> {usuario.estado}
                </p>
              </div>

              {usuario.rol === RolUsuario.usuarioAdministrador ? (
                <p className={styles.advertencia}>
                  Este usuario es administrador y no puede modificarse.
                </p>
              ) : (
                <>
                  <div className={styles.selectorRol}>
                    <label htmlFor="rol">Nuevo rol</label>

                    <select
                      id="rol"
                      value={rolSeleccionado}
                      onChange={(e) =>
                        setRolSeleccionado(e.target.value as RolUsuario)
                      }
                      className={styles.select}
                    >
                      <option value={RolUsuario.usuarioNormal}>Usuario</option>

                      <option value={RolUsuario.usuarioModerador}>
                        Moderador
                      </option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className={styles.botonPrimario}
                    disabled={!hayCambios}
                    onClick={() => setMostrarConfirmacion(true)}
                  >
                    {hayCambios
                      ? "Guardar cambios"
                      : `El usuario ya tiene rol ${obtenerTextoRol(usuario.rol)}`}
                  </button>
                </>
              )}
            </section>
          )}

          {cargando && <section className={styles.card}>Cargando...</section>}

          {mensaje && <section className={styles.card}>{mensaje}</section>}
        </div>
      </main>

      {mostrarConfirmacion && usuario && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Confirmar cambio</h3>

            <p>
              ¿Desea cambiar el rol de
              <strong> {usuario.nombreUsuario}</strong>?
            </p>

            <div className={styles.modalBotones}>
              <button
                type="button"
                className={styles.botonSecundario}
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.botonPrimario}
                onClick={async () => {
                  setMostrarConfirmacion(false);
                  await guardarCambios();
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
