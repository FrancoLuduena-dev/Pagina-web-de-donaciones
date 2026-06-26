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
 * Permite al usuario cambiar su contraseña actual por una nueva.
 * Requiere ingresar la contraseña actual y confirmar la nueva contraseña.
 *
 * @component
 * @returns {JSX.Element} Formulario de restablecimiento de contraseña.
 */

export default function ResetPasswordPage() {

    const router = useRouter();

    /** Contraseña actual del usuario */
    const [contraseniaActual, setContraseniaActual] = useState("");

    /** Nueva contraseña ingresada */
    const [contraseniaNueva, setContraseniaNueva] = useState("");

    /** Confirmación de la nueva contraseña */
    const [contraseniaNuevaDos, setContraseniaNuevaDos] = useState("");

    /** Mensaje de error a mostrar en la UI */
    const [error, setError] = useState<string | null>(null);

    /** Indica si la solicitud está en proceso */
    const [loading, setLoading] = useState(false);

    /**
     * Maneja el envío del formulario de restablecimiento.
     *
     * Realiza las siguientes acciones:
     * - Previene el comportamiento por defecto del formulario.
     * - Valida que las contraseñas nuevas coincidan.
     * - Envía la solicitud al backend para actualizar la contraseña.
     * - Redirige al usuario al login en caso de éxito.
     * - Muestra errores en caso de fallo.
     *
     * @param {FormEvent} e Evento de envío del formulario.
     * @returns {Promise<void>}
     */
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            /**
       * Enviar solicitud al backend para actualizar contraseña
       */
            const data = await resetPasswordRequest({
                contraseniaActual: contraseniaActual.trim(),
                contraseniaNueva: contraseniaNueva.trim(),
            });

            /**
  * Redirigir al login luego de cambiar la contraseña
  */
            router.push("/login");
            router.refresh();
        } catch (err) {
            /**
      * Manejo de errores
      */
            setError(
                err instanceof Error
                    ? err.message
                    : "Error desconocido."
            );
        } finally {
            /**
      * Finaliza estado de carga
      */
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