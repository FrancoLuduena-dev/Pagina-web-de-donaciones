"use client";

import { persistSession } from "@/lib/auth";
import { useRouter } from "next/dist/client/components/navigation";
import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "./reset.module.css"
import { resetPasswordRequest } from "@/lib/auth";

/**
 * Página de restablecimiento de contraseña.
 *
 * @returns Formulario de restablecimiento de contraseña.
 */

export default function ResetPasswordPage() {

    const router = useRouter();

    const [contraseniaActual, setContraseniaActual] = useState("");
    const [contraseniaNueva, setContraseniaNueva] = useState("");
    const [contraseniaNuevaDos, setContraseniaNuevaDos] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /**
     * Maneja el envío del formulario.
     *
     * @param e Evento de envío del formulario.
     */
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            // validar que la contraseña nueva tenga al menos 6 caracteres
            const data = await resetPasswordRequest({
                contraseniaActual: contraseniaActual.trim(),
                contraseniaNueva: contraseniaNueva.trim(),
            });


            router.push("/login");
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
                  <h1 className={styles.title}>Restablecer contraseña</h1>
                  <p className={styles.subtitle}>
                      Para restablecer tu contraseña, por favor llene los siguientes campos.
                  </p>
              </div>

              <form
                  onSubmit={handleSubmit}
                  className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="contraseñaActual">
                            ingrese la contraseña actual 
                        </label>
                        <input
                            id="contraseniaActual"
                            type="password"
                            value={contraseniaActual}
                            onChange={(e) => setContraseniaActual(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="contraseniaNueva">
                            ingrese la nueva contraseña
                        </label>
                        <input
                            id="contraseniaNueva"
                            type="password"
                            value={contraseniaNueva}
                            onChange={(e) => setContraseniaNueva(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    {/*validar que las contraseñas coincidan con un script*/}

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="contraseniaNuevaDos">
                            vuelva a ingresar la nueva contraseña
                        </label>
                        <input
                            id="contraseniaNuevaDos"
                            type="password"
                            value={contraseniaNuevaDos}
                            onChange={(e) => setContraseniaNuevaDos(e.target.value)}
                            className={styles.input}
                            required
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
                        {loading ? "Restableciendo..." : "Restablecer"}
                    </button>

              </form>

              <p className={styles.backLinkContainer}>
                  <Link
                      href="/usuario/editar"
                      className={styles.backLink}
                  >
                      Volver atras
                  </Link>
              </p>
      </div>
    </main>
  );
}