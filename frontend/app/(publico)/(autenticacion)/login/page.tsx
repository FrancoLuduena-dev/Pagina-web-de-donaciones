"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginRequest, persistSession } from "@/lib/auth";
import styles from "./login.module.css";

/**
 * Página de inicio de sesión.
 *
 * Permite autenticar usuarios y guardar la sesión activa.
 *
 * @returns Formulario de login.
 */
export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
 * Maneja el envío del formulario de login.
 *
 * Autentica al usuario y redirige al inicio si el acceso es exitoso.
 *
 * @param e - Evento de envío del formulario.
 */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      // probar poner una validacion de que el correo sea un @hotmail.com o @gmail.com etc y que la contraseña tenga al menos 6 caracteres 
      const data = await loginRequest({
        correo: correo.trim(),
        contrasenia,
      });

      persistSession(data);

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