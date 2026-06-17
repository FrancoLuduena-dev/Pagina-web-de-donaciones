"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RemoteImage from "@/components/RemoteImage";
import {
  CATEGORIA_IDS,
  CONDICIONES_OBJETO,
  categoriaIdToEnum,
  type CondicionObjeto,
} from "@/constants/publicacionesBackend";
import {
  editarPublicacionRequest,
  obtenerPublicacionRequest,
  subirImagenPublicacionRequest,
} from "@/lib/publicaciones";
import { CategoriaPublicacion } from "@/types/CategoriaPublicacion";

export default function EditarPublicacionPage() {
  const params = useParams<{ idPublicacion: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: CategoriaPublicacion.INDUMENTARIA,
    condicion: "USADO_BUENO" as CondicionObjeto,
    imagenUrl: "",
  });
  const [imagenPreview, setImagenPreview] = useState<string>("");
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [noEncontrada, setNoEncontrada] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarPublicacion() {
      setCargando(true);
      setError("");
      setNoEncontrada(false);

      try {
        const publicacion = await obtenerPublicacionRequest(params.idPublicacion);

        if (!activo) return;

        setForm({
          titulo: publicacion.titulo,
          descripcion: publicacion.descripcion,
          categoria: categoriaIdToEnum(publicacion.categoriaId),
          condicion: publicacion.condicion as CondicionObjeto,
          imagenUrl: publicacion.imagenUrl,
        });
        setImagenPreview(publicacion.imagenUrl);
      } catch (err) {
        if (!activo) return;

        const mensaje =
          err instanceof Error ? err.message : "No se pudo cargar la publicación.";

        if (mensaje.toLowerCase().includes("404")) {
          setNoEncontrada(true);
        } else {
          setError(mensaje);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarPublicacion();

    return () => {
      activo = false;
    };
  }, [params.idPublicacion]);

  const manejarArchivo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setArchivoImagen(file);
    const reader = new FileReader();
    reader.onload = () => setImagenPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const guardar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setGuardando(true);

    try {
      let imagenUrl = form.imagenUrl.trim();

      if (archivoImagen) {
        imagenUrl = await subirImagenPublicacionRequest(archivoImagen);
      }

      await editarPublicacionRequest(params.idPublicacion, {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        categoriaId: CATEGORIA_IDS[form.categoria],
        condicion: form.condicion,
        ...(imagenUrl ? { imagenUrl } : {}),
      });

      router.push(`/publicaciones/publicacion/${params.idPublicacion}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo editar la publicación.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <main style={{ padding: "2rem" }}>Cargando publicación...</main>;
  }

  if (noEncontrada) {
    return <main style={{ padding: "2rem" }}>Publicación no encontrada.</main>;
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 760, margin: "0 auto" }}>
      <h1>Editar publicación</h1>
      <p style={{ color: "#4b5563", marginBottom: "1rem" }}>
        Los cambios se guardan en el backend. Tenés que ser el creador de la publicación.
      </p>

      {error ? (
        <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>
      ) : null}

      <form onSubmit={guardar} style={{ display: "grid", gap: "0.9rem" }}>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Título
          <input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            style={inputStyle}
            minLength={3}
            required
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Descripción
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={4}
            style={inputStyle}
            minLength={10}
            required
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Categoría
          <select
            value={form.categoria}
            onChange={(e) =>
              setForm({ ...form, categoria: e.target.value as CategoriaPublicacion })
            }
            style={inputStyle}
          >
            {Object.values(CategoriaPublicacion).map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Condición del objeto
          <select
            value={form.condicion}
            onChange={(e) =>
              setForm({ ...form, condicion: e.target.value as CondicionObjeto })
            }
            style={inputStyle}
          >
            {CONDICIONES_OBJETO.map((condicion) => (
              <option key={condicion.value} value={condicion.value}>
                {condicion.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          URL de imagen (opcional si subís un archivo)
          <input
            value={form.imagenUrl}
            onChange={(e) => {
              setForm({ ...form, imagenUrl: e.target.value });
              setImagenPreview(e.target.value);
              setArchivoImagen(null);
            }}
            style={inputStyle}
            placeholder="https://..."
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Subir nueva imagen
          <input type="file" accept="image/*" onChange={manejarArchivo} style={inputStyle} />
        </label>

        {imagenPreview ? (
          imagenPreview.startsWith("data:") ? (
            <img
              src={imagenPreview}
              alt="Vista previa"
              style={{
                width: "100%",
                maxWidth: 320,
                borderRadius: "1rem",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{ position: "relative", width: 320, height: 220 }}>
              <RemoteImage
                src={imagenPreview}
                alt="Vista previa"
                fill
                loading="eager"
              />
            </div>
          )
        ) : null}

        <div style={actionsStyle}>
          <Link
            href={`/publicaciones/publicacion/${params.idPublicacion}`}
            style={exitButtonStyle}
          >
            Salir
          </Link>
          <button type="submit" style={buttonStyle} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: "0.75rem",
  padding: "0.75rem 0.9rem",
  fontSize: "1rem",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  alignItems: "center",
  marginTop: "0.5rem",
};

const exitButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.75rem 1rem",
  borderRadius: "999px",
  border: "1px solid var(--color-borde)",
  background: "var(--color-tarjeta)",
  color: "var(--color-texto-principal)",
  fontWeight: 500,
  textDecoration: "none",
  cursor: "pointer",
};

const buttonStyle: React.CSSProperties = {
  width: "fit-content",
  padding: "0.75rem 1rem",
  borderRadius: "999px",
  border: "none",
  background: "#1f6feb",
  color: "white",
  cursor: "pointer",
};
