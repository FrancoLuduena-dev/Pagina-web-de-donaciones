"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { registerRequest, persistSession } from "@/lib/auth";
import styles from "./editar.module.css"
import { editarPerfilRequest as editarRequest } from "@/lib/auth";

export default function EditarUsuarioPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [correoDos, setCorreoDos] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [numeroTelefono, setNumeroTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
 * Página para editar la información del usuario.
 *
 * Permite modificar datos del perfil como correo, nombre,
 * usuario y teléfono. Los campos vacíos no se actualizan.
 *
 * @returns Formulario de edición de perfil.
 */
  async function handleSubmit(e: FormEvent) {
    /**
 * Maneja el envío del formulario de edición de perfil.
 *
 * Valida que los correos coincidan (si se ingresan),
 * envía los datos al backend y actualiza la información del usuario.
 * Luego redirige a la página de perfil.
 *
 * @param e Evento de envío del formulario.
 */
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {

      if (correo && correoDos && correo.trim() !== correoDos.trim()) {
        throw new Error("Los correos no coinciden.");
      }
      
      const data = await editarRequest({
        correo: correo.trim(),
        nombreUsuario,
        nombreCompleto,
        numeroTelefono: numeroTelefono.replace(/\D/g, ''),
      });

      router.push("/usuario");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido."
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Editar informacion de perfil
          </h1>
          <p className={styles.subtitle}>
            Llene el formulario para editar su informacion de perfil. 
          </p>
          <p className={styles.subtitle}>
            Los campos que deje vacios no seran modificados.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={styles.form}>

          <div className={styles.field}>
            <label
              htmlFor="correo"
              className={styles.label}
            >
              Correo
            </label>

            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(e) =>
                setCorreo(e.target.value)
              }
              className={styles.input}
            />
            <div className={styles.guidelines}>
              <p>Requisitos del correo:</p>
              <ul>
                <li>Debe ser formato ejemplo@dominio.com</li>
                <li>No debe tener espacios</li>
                <li>Debe ser un correo real</li>
              </ul>
            </div>
            
          </div>

          <div className={styles.field}>
            <label
              htmlFor="correo"
              className={styles.label}
            >
              confirme su correo
            </label>

            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              value={correoDos}
              onChange={(e) =>
                setCorreoDos(e.target.value)
              }
              className={styles.input}
            />
            
          </div>

          <div className={styles.field}>
            <label
              htmlFor="nombreUsuario"
              className={styles.label}
            >
              Nombre de usuario
            </label>

            <input
              id="nombreUsuario"
              name="nombreUsuario"
              type="text"
              autoComplete="username"
              value={nombreUsuario}
              onChange={(e) =>
                setNombreUsuario(e.target.value)
              }
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label
              htmlFor="nombreCompleto"
              className={styles.label}
            >
              Nombre completo
            </label>

            <input
              id="nombreCompleto"
              name="nombreCompleto"
              type="text"
              autoComplete="name"
              value={nombreCompleto}
              onChange={(e) =>
                setNombreCompleto(e.target.value)
              }
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label
              htmlFor="numeroTelefono"
              className={styles.label}
            >
              Número de teléfono
            </label>

            <input
              id="numeroTelefono"
              name="numeroTelefono"
              type="tel"
              autoComplete="tel"
              pattern="^\+?[0-9\s]{8,20}$"
              placeholder="Ejemplo de formato: +54 9 11 1234 5678 o 1234 5678"
              value={numeroTelefono}
              onChange={(e) =>
                setNumeroTelefono(e.target.value)
              }
              className={styles.input}
            />
          </div>

          {error ? (
            <p
              className={styles.error}
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? "actualizando..." : "Actualizar perfil"}
          </button>

        </form>

        <p className={styles.backLinkContainer}>
          Para restablecer tu contraseña {" "}
          <Link
            href="/usuario/reset-password"
            className={styles.backLink}
          >
            ingresa aca
          </Link>
        </p>

        <p className={styles.backLinkContainer}>
          <Link
            href="/usuario"
            className={styles.backLink}
          >
            volver atras
          </Link>
        </p>
      </div>
    </main>
  );
}
