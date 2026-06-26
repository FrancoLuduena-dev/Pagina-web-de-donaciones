"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginRequest, persistSession } from "@/lib/auth";
import styles from "./login.module.css";

/**
 * Página de inicio de sesión.
 *
 * Renderiza un formulario que permite:
 * - Autenticar usuarios existentes
 * - Manejar errores de autenticación
 * - Persistir la sesión del usuario
 * - Redirigir tras login exitoso
 *
 * Incluye manejo de:
 * - Estados de carga
 * - Mensajes de error
 *
 * @returns Componente de formulario de login
 */
export default function LoginPage() {
  const router = useRouter();
  /**
   * Estados del formulario de login.
   */
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
 * Maneja el envío del formulario de login.
 *
 * Flujo:
 * 1. Previene el comportamiento por defecto
 * 2. Limpia errores previos
 * 3. Ejecuta la autenticación contra el backend
 * 4. Guarda la sesión en localStorage
 * 5. Redirige al usuario a la sección principal
 *
 * @param e Evento de submit del formulario
 *
 * @throws Error si:
 * - Credenciales inválidas
 * - Error de red
 * - Error del servidor
 */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    /** Mensaje de error mostrado al usuario */
    setError(null);


    /** Indica si se está procesando el login */
    setLoading(true);

    try {
      // probar poner una validacion de que el correo sea un @hotmail.com o @gmail.com etc y que la contraseña tenga al menos 6 caracteres 
      const data = await loginRequest({
        correo: correo.trim(),
        contrasenia,
      });

      /**
 * Persiste el token de autenticación en localStorage
 * para mantener la sesión activa del usuario.
 */
      persistSession(data);

      /**
 * Redirige al usuario autenticado a la sección de publicaciones
 * y refresca el estado de la aplicación.
 */
      router.push("/publicaciones");
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

  /**
 * Flujo de autenticación:
 *
 * 1. Usuario ingresa credenciales
 * 2. Se envía request al backend
 * 3. Si es exitoso:
 *    - Se guarda el token
 *    - Se redirige a /publicaciones
 * 4. Si falla:
 *    - Se muestra error en pantalla
 */

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Iniciar sesión
          </h1>

          <p className={styles.subtitle}>
            Accedé a tu cuenta para seguir donando.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
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
              required
              value={correo}
              onChange={(e) =>
                setCorreo(e.target.value)
              }
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label
              htmlFor="contraseña"
              className={styles.label}
            >
              Contraseña
            </label>

            <input
              id="contraseña"
              name="contraseña"
              type="password"
              autoComplete="current-password"
              required
              value={contrasenia}
              onChange={(e) =>
                setContrasenia(e.target.value)
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
            disabled={loading}
            className={styles.button}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className={styles.backLinkContainer}>
          <Link
            href="/"
            className={styles.backLink}
          >
            Volver al inicio
          </Link>
        </p>

        <p className={styles.backLinkContainer}>
          ¿No tenés una cuenta?{" "}
          <Link
            href="/register"
            className={styles.backLink}
          >
            Registrate
          </Link>
        </p>

        <p className={styles.backLinkContainer}>
          ¿Olvidaste tu contraseña? Manda un correo a pagina@donaciones.com
        </p>
      </div>
    </main>
  );
}