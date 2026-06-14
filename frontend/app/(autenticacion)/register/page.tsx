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
            // la contraseña tiene que tener al menos 6 caracteres y el correo tiene que ser un formato valido 
            // validaciones front
            const contraseniasCoinciden = contrasenia === contraseniaDos;
            const correosCoinciden = correo.trim() === correoDos.trim();

            if (!contraseniasCoinciden) {
                throw new Error("Las contraseñas no coinciden.");
            }

            if (!correosCoinciden) {
                throw new Error("Los correos no coinciden.");
            }

            //validaciones en el backend
          const data = await registerRequest({
            correo: correo.trim(),
            contrasenia,
            nombreUsuario,
            nombreCompleto,
            numeroTelefono,
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
      // agregar texto que le diga al usuario que la contraseña tiene que tener al menos 6 caracteres y el correo tiene que ser un formato valido
      // agregar un modal que le indique al usuario como debe ser el formato de su contraseña y correo 
      // agregar script de comparacion entre correo y contraseña para que el usuario tenga que escribirlo dos veces y comparar ambos campos para validar que sean iguales, y mostrar un mensaje de error si no lo son
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

                {/*validar que las contraseñas coincidan con un script*/}

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