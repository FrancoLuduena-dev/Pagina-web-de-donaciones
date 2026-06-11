"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, use, useState } from "react";
import { registerRequest, persistSession } from "@/lib/auth";
import styles from "./register.module.css"

/**
 * Página de registro de usuarios.
 *
 * @returns Formulario de registro.
 */
export default function RegisterPage() {

    const router = useRouter();

    const [correo, setCorreo] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [nombreCompleto, setNombreCompleto] = useState("");
    const [numeroTelefono, setNumeroTelefono] = useState("");
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
          const data = await registerRequest({
            correo: correo.trim(),
            contraseña,
            nombreUsuario,
            nombreCompleto,
            numeroTelefono,
          });
    
          persistSession(data);
    
          router.push("/");
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
                        Registrarse
                    </h1>
                    <p className={styles.subtitle}>
                        Llene el formulario para crear una cuenta.
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
                        value={contraseña}
                        onChange={(e) =>
                            setContraseña(e.target.value)
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
                        required
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
                        required
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
                        required
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
                        {loading ? "Registrando..." : "Registrarse"}
                    </button>

                </form>

                <p className={styles.backLinkContainer}>
                     ¿Ya tenés una cuenta?{" "}
                    <Link
                        href="/login"
                        className={styles.backLink}
                    >
                        inicia sesión
                    </Link>
                </p>
            </div>
        </main>
    )
}