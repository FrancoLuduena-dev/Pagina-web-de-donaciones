"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { registerRequest } from "@/lib/auth";
import styles from "./register.module.css"


/**
 * Página de registro de usuarios.
 *
 * @returns Formulario de registro.
 */
export default function RegisterPage() {

    const router = useRouter();

    const [correo, setCorreo] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [nombreCompleto, setNombreCompleto] = useState("");
    const [numeroTelefono, setNumeroTelefono] = useState("");
    const [correoDos, setCorreoDos] = useState("");
    const [contraseniaDos, setContraseniaDos] = useState("");
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
            // validaciones front
            const contraseniasCoinciden = contrasenia === contraseniaDos;
            const correosCoinciden = correo.trim() === correoDos.trim();
            const contraseniaFormato = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(contrasenia);

            if (!contraseniasCoinciden) {
                throw new Error("Las contraseñas no coinciden.");
            }

            if (!correosCoinciden) {
                throw new Error("Los correos no coinciden.");
            }

            const isMailValid = /^\S+@\S+\.\S+$/.test(correo.trim());

            if (!isMailValid) {
                throw new Error("El formato del correo no es válido.");
            }

            if (!contraseniaFormato ) {
                throw new Error("El formato de la contraseña no es valido") 
            }

            //validaciones en el backend
            const data = await registerRequest({
                correo: correo.trim(),
                contrasenia,
                nombreUsuario,
                nombreCompleto,
                numeroTelefono: numeroTelefono.replace(/\s+/g, ''),
            });

          //caso exito redirige al login
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
                        Confirme su correo
                    </label>

                    <input
                        id="correo"
                        name="correo"
                        type="email"
                        autoComplete="email"
                        required
                        value={correoDos}
                        onChange={(e) =>
                            setCorreoDos(e.target.value)
                        }
                        className={styles.input}
                    />
                </div>

                <div className={styles.field}>
                    <label
                        htmlFor="contrasenia"
                        className={styles.label}
                    >
                        Contraseña
                    </label>
                    <input
                        id="contrasenia"
                        name="contrasenia"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={contrasenia}
                        onChange={(e) =>
                            setContrasenia(e.target.value)
                        }
                        className={styles.input}
                    />
                        <div className={styles.guidelines}>
                            <p>Requisitos de la contraseña:</p>
                            <ul>
                                <li>Mínimo 8 caracteres</li>
                                <li>Usar letras, números</li>
                                <li>Usar al menos una mayuscula, una minuscula, un numero y un simbolo</li>
                                <li>Prohibido usar # y ?</li>
                            </ul>
                        </div>
                </div>

                <div className={styles.field}>
                    <label
                        htmlFor="contrasenia"
                        className={styles.label}
                    >
                        Confirme su contraseña
                    </label>

                    <input
                        id="contrasenia"
                        name="contrasenia"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={contraseniaDos}
                        onChange={(e) =>
                            setContraseniaDos(e.target.value)
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
                        inputMode="tel"
                        autoComplete="tel"
                        pattern="^\+?[0-9\s]{8,20}$"
                        placeholder="Ejemplo de formato: +54 9 11 1234 5678 o 1234 5678"
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

                    {/*validar todos los campos cuando toque el boton*/}
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
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </main>
    )
}