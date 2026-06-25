"use client";

import { useEffect, useState } from "react";

import DenunciaCard from "@/components/denuncias/DenunciaCard";
import { obtenerDenuncias, tomarDenuncia, resolverDenuncia } from "@/lib/denuncias";
import { Denuncia } from "@/types/Denuncia";
import { RolUsuario } from "@/types/RolUsuario";
import styles from "./denuncias.module.css";

interface UsuarioActual {
  id: string;
  rol: RolUsuario;
}

/**
 * Página para ver y resolver denuncias.
 * @returns Interfaz de moderación de denuncias.
 */
export default function PaginaDenuncias() {
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idDenunciaSeleccionada, setIdDenunciaSeleccionada] = useState<string | null>(null);

  const [tipoResolucion, setTipoResolucion] = useState("");

  const [detalleResolucion, setDetalleResolucion] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          return;
        }

        const usuarioResponse = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const usuarioData = await usuarioResponse.json();

        setUsuario(usuarioData);

        const denunciasData = await obtenerDenuncias(token);

        setDenuncias(denunciasData);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  if (cargando) {
    return <p>Cargando denuncias...</p>;
  }

  if (!usuario) {
    return null;
  }

  const esAdministrador = usuario.rol === RolUsuario.usuarioAdministrador;

  const denunciasDisponibles = denuncias.filter((denuncia) => denuncia.estado === "PENDIENTE");

  const misDenuncias = denuncias.filter((denuncia) => denuncia.estado === "EN_REVISION" && denuncia.moderadorAsignadoId === usuario.id);

  const manejarTomarDenuncia = async (denuncia: Denuncia) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        return;
      }

      await tomarDenuncia(denuncia.id, denuncia.version, token);

      const denunciasActualizadas = await obtenerDenuncias(token);

      setDenuncias(denunciasActualizadas);
    } catch (error) {
      console.error(error);
    }
  };

  const manejarResolverDenuncia = async (denuncia: Denuncia) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        return;
      }

      if (!tipoResolucion) {
        alert("Debes seleccionar una resolución.");
        return;
      }

      const detalle = detalleResolucion.trim();

      if (detalle.length < 15) {
        alert("El detalle debe tener al menos 15 caracteres.");
        return;
      }

      await resolverDenuncia(denuncia.id, denuncia.version, tipoResolucion, detalle, token);

      const denunciasActualizadas = await obtenerDenuncias(token);

      setDenuncias(denunciasActualizadas);

      setIdDenunciaSeleccionada(null);

      setTipoResolucion("");

      setDetalleResolucion("");
    } catch (error) {
      console.error(error);

      alert("No se pudo resolver la denuncia.");
    }
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.titulo}>Denuncias</h1>

      {esAdministrador ? (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Todas las denuncias</h2>

          <div className={styles.grid}>
            {denuncias.length > 0 ? (
              denuncias.map((denuncia) => <DenunciaCard key={denuncia.id} denuncia={denuncia} mostrarBotonTomar={denuncia.estado === "PENDIENTE"} onTomar={() => manejarTomarDenuncia(denuncia)} />)
            ) : (
              <p className={styles.vacio}>No hay denuncias registradas.</p>
            )}
          </div>
        </section>
      ) : (
        <>
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Denuncias disponibles</h2>

            <div className={styles.grid}>
              {denunciasDisponibles.length > 0 ? (
                denunciasDisponibles.map((denuncia) => <DenunciaCard key={denuncia.id} denuncia={denuncia} mostrarBotonTomar onTomar={() => manejarTomarDenuncia(denuncia)} />)
              ) : (
                <p className={styles.vacio}>No hay denuncias disponibles.</p>
              )}
            </div>
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Mis denuncias</h2>

            <div className={styles.grid}>
              {misDenuncias.length > 0 ? (
                misDenuncias.map((denuncia) => (
                  <div key={denuncia.id}>
                    <DenunciaCard denuncia={denuncia} mostrarBotonResolver onResolver={() => setIdDenunciaSeleccionada(denuncia.id)} />

                    {idDenunciaSeleccionada === denuncia.id && (
                      <section className={styles.panelResolucion}>
                        <h3>Resolver denuncia</h3>

                        <label className={styles.label}>Tipo de resolución</label>

                        <select className={styles.select} value={tipoResolucion} onChange={(event) => setTipoResolucion(event.target.value)}>
                          <option value="">Seleccionar</option>

                          <option value="DESCARTADA">Descartada</option>

                          <option value="PUBLICACION_PAUSADA">Publicación pausada</option>

                          <option value="PUBLICACION_ELIMINADA">Publicación eliminada</option>

                          <option value="USUARIO_BLOQUEADO">Usuario bloqueado</option>
                        </select>

                        <label className={styles.label}>Detalle</label>

                        <textarea className={styles.textarea} value={detalleResolucion} onChange={(event) => setDetalleResolucion(event.target.value)} rows={4} maxLength={500} />

                        <div className={styles.acciones}>
                          <button
                            type="button"
                            className={styles.botonCancelar}
                            onClick={() => {
                              setIdDenunciaSeleccionada(null);

                              setTipoResolucion("");

                              setDetalleResolucion("");
                            }}
                          >
                            Cancelar
                          </button>

                          <button type="button" className={styles.botonResolver} onClick={() => manejarResolverDenuncia(denuncia)}>
                            Confirmar resolución
                          </button>
                        </div>
                      </section>
                    )}
                  </div>
                ))
              ) : (
                <p className={styles.vacio}>No tienes denuncias asignadas.</p>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
