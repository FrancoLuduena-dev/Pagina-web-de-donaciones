"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  MOTIVOS_DENUNCIA,
  type MotivoDenuncia,
} from "@/constants/denuncias";
import { obtenerUsuarioActualRequest } from "@/lib/auth";
import { crearDenunciaRequest } from "@/lib/denuncias";

import styles from "./DenunciarPublicacionButton.module.css";

type DenunciarPublicacionButtonProps = {
  idPublicacion: string;
  creadorId: string;
};

/**
 * Botón y formulario para denunciar una publicación.
 *
 * Comprueba la sesión del usuario: si no hay sesión muestra un enlace a login,
 * y si el usuario es el creador no se renderiza. Permite elegir un motivo y un
 * comentario opcional (obligatorio para el motivo "OTRO"), envía la denuncia y
 * refleja los estados de éxito o de denuncia ya existente.
 *
 * @param props Propiedades del componente.
 * @param props.idPublicacion Identificador de la publicación a denunciar.
 * @param props.creadorId Identificador del creador de la publicación.
 * @returns Botón/formulario de denuncia, enlace a login o `null` según el caso.
 */
export default function DenunciarPublicacionButton({
  idPublicacion,
  creadorId,
}: DenunciarPublicacionButtonProps) {
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [motivo, setMotivo] = useState<MotivoDenuncia>("CONTENIDO_INAPROPIADO");
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [yaDenunciada, setYaDenunciada] = useState(false);
  const [esCreador, setEsCreador] = useState(false);
  const [sinSesion, setSinSesion] = useState(false);

  useEffect(() => {
    let activo = true;

    async function verificarEstado() {
      setCargando(true);
      setError("");
      setSinSesion(false);
      setEsCreador(false);

      try {
        const usuario = await obtenerUsuarioActualRequest();

        if (!activo) return;

        if (!usuario) {
          setSinSesion(true);
          return;
        }

        if (usuario.id === creadorId) {
          setEsCreador(true);
        }
      } catch {
        if (activo) {
          setError("No se pudo verificar si podés denunciar esta publicación.");
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    void verificarEstado();

    return () => {
      activo = false;
    };
  }, [creadorId]);

  const enviarDenuncia = async () => {
    setError("");

    const comentarioLimpio = comentario.trim();

    if (motivo === "OTRO" && comentarioLimpio.length < 10) {
      setError("Para “Otro motivo” tenés que explicar la situación (mínimo 10 caracteres).");
      return;
    }

    if (comentarioLimpio.length > 0 && comentarioLimpio.length < 10) {
      setError("Si agregás un comentario, debe tener al menos 10 caracteres.");
      return;
    }

    setEnviando(true);

    try {
      await crearDenunciaRequest({
        publicacionId: idPublicacion,
        motivo,
        comentario: comentarioLimpio || undefined,
      });

      setExito(true);
      setMostrarFormulario(false);
      setComentario("");
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "No se pudo enviar la denuncia.";

      if (mensaje.includes("Ya denunciaste")) {
        setYaDenunciada(true);
        setMostrarFormulario(false);
      }

      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando || esCreador) {
    return null;
  }

  if (sinSesion) {
    return (
      <Link href="/login" className={styles.botonSecundario}>
        Iniciá sesión para denunciar
      </Link>
    );
  }

  if (exito || yaDenunciada) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.exito}>
          {exito
            ? "Denuncia enviada. Un moderador la revisará."
            : "Ya denunciaste esta publicación."}
        </p>
      </div>
    );
  }

  if (!mostrarFormulario) {
    return (
      <div className={styles.wrapper}>
        <button
          type="button"
          className={styles.boton}
          onClick={() => setMostrarFormulario(true)}
        >
          Denunciar
        </button>
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={styles.formulario}>
      <label className={styles.label}>
        Motivo
        <select
          className={styles.select}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value as MotivoDenuncia)}
        >
          {MOTIVOS_DENUNCIA.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.label}>
        Comentario {motivo === "OTRO" ? "(obligatorio)" : "(opcional)"}
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Contanos qué problema encontraste..."
          className={styles.textarea}
        />
      </label>

      <p className={styles.ayuda}>
        Tu denuncia será revisada por un moderador. No compartas datos personales
        sensibles.
      </p>

      <div className={styles.acciones}>
        <button
          type="button"
          className={styles.boton}
          onClick={() => void enviarDenuncia()}
          disabled={enviando}
        >
          {enviando ? "Enviando..." : "Enviar denuncia"}
        </button>
        <button
          type="button"
          className={styles.botonSecundario}
          onClick={() => {
            setMostrarFormulario(false);
            setComentario("");
            setError("");
          }}
          disabled={enviando}
        >
          Cancelar
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
