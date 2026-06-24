"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RemoteImage from "@/components/RemoteImage";
import {
  CATEGORIA_IDS,
  CONDICIONES_OBJETO,
  MAX_IMAGENES_PUBLICACION,
  categoriaIdToEnum,
  getImagenesPublicacion,
  type CondicionObjeto,
} from "@/constants/publicacionesBackend";
import {
  LOCALIDADES_VICENTE_LOPEZ,
  MUNICIPIO_VICENTE_LOPEZ,
} from "@/constants/localidadesVicenteLopez";
import {
  editarPublicacionRequest,
  obtenerPublicacionRequest,
  subirImagenesPublicacionRequest,
} from "@/lib/publicaciones";
import { CategoriaPublicacion } from "@/types/CategoriaPublicacion";

function parseUrlsTexto(texto: string): string[] {
  return texto
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);
}

export default function EditarPublicacionPage() {
  const params = useParams<{ idPublicacion: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: CategoriaPublicacion.INDUMENTARIA,
    condicion: "USADO_BUENO" as CondicionObjeto,
    localidadId: LOCALIDADES_VICENTE_LOPEZ[0].id,
  });
  const [imagenesActuales, setImagenesActuales] = useState<string[]>([]);
  const [urlsImagen, setUrlsImagen] = useState("");
  const [archivosNuevos, setArchivosNuevos] = useState<File[]>([]);
  const [previewsNuevos, setPreviewsNuevos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [sinPermiso, setSinPermiso] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarPublicacion() {
      setCargando(true);
      setError("");
      setNoEncontrada(false);
      setSinPermiso(false);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const publicacion = await obtenerPublicacionRequest(params.idPublicacion);

        if (!activo) return;

        const meRes = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!meRes.ok) {
          throw new Error("No se pudo verificar tu sesión.");
        }

        const usuario = await meRes.json();

        if (!activo) return;

        if (usuario.id !== publicacion.creadorId) {
          setSinPermiso(true);
          return;
        }

        setForm({
          titulo: publicacion.titulo,
          descripcion: publicacion.descripcion,
          categoria: categoriaIdToEnum(publicacion.categoriaId),
          condicion: publicacion.condicion as CondicionObjeto,
          localidadId: publicacion.localidadId,
        });
        setImagenesActuales(getImagenesPublicacion(publicacion));
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
  }, [params.idPublicacion, router]);

  const manejarArchivos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const total = imagenesActuales.length + parseUrlsTexto(urlsImagen).length + archivosNuevos.length + files.length;
    if (total > MAX_IMAGENES_PUBLICACION) {
      setError(`Podés tener hasta ${MAX_IMAGENES_PUBLICACION} imágenes en total.`);
      return;
    }

    setError("");
    const combinados = [...archivosNuevos, ...files];
    setArchivosNuevos(combinados);

    combinados.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewsNuevos((prev) => {
          const next = [...prev];
          next[index] = String(reader.result ?? "");
          return next;
        });
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const quitarImagenActual = (index: number) => {
    setImagenesActuales((prev) => prev.filter((_, i) => i !== index));
  };

  const quitarArchivoNuevo = (index: number) => {
    setArchivosNuevos((prev) => prev.filter((_, i) => i !== index));
    setPreviewsNuevos((prev) => prev.filter((_, i) => i !== index));
  };

  const guardar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setGuardando(true);

    try {
      const urlsManuales = parseUrlsTexto(urlsImagen);
      const urlsSubidas =
        archivosNuevos.length > 0
          ? await subirImagenesPublicacionRequest(archivosNuevos)
          : [];

      const imagenUrls = [...imagenesActuales, ...urlsSubidas, ...urlsManuales];

      if (!imagenUrls.length) {
        throw new Error("La publicación debe tener al menos una imagen.");
      }

      if (imagenUrls.length > MAX_IMAGENES_PUBLICACION) {
        throw new Error(`Podés tener hasta ${MAX_IMAGENES_PUBLICACION} imágenes en total.`);
      }

      await editarPublicacionRequest(params.idPublicacion, {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        categoriaId: CATEGORIA_IDS[form.categoria],
        localidadId: form.localidadId,
        condicion: form.condicion,
        imagenUrls,
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

  if (sinPermiso) {
    return (
      <main style={{ padding: "2rem", maxWidth: 760, margin: "0 auto" }}>
        <h1>Sin permiso</h1>
        <p style={{ color: "#4b5563", marginBottom: "1rem" }}>
          Solo el creador puede editar esta publicación.
        </p>
        <Link
          href={`/publicaciones/publicacion/${params.idPublicacion}`}
          style={{ color: "#1f6feb", fontWeight: 600 }}
        >
          Volver al detalle
        </Link>
      </main>
    );
  }

  const urlsManualesCount = parseUrlsTexto(urlsImagen).length;
  const totalImagenes = imagenesActuales.length + urlsManualesCount + archivosNuevos.length;

  return (
    <main style={{ padding: "2rem", maxWidth: 760, margin: "0 auto" }}>
      <h1>Editar publicación</h1>
      <p style={{ color: "#4b5563", marginBottom: "1rem" }}>
        Podés tener hasta {MAX_IMAGENES_PUBLICACION} imágenes. Tenés que ser el creador.
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
          Localidad ({MUNICIPIO_VICENTE_LOPEZ})
          <select
            value={form.localidadId}
            onChange={(e) => setForm({ ...form, localidadId: e.target.value })}
            style={inputStyle}
            required
          >
            {LOCALIDADES_VICENTE_LOPEZ.map((localidad) => (
              <option key={localidad.id} value={localidad.id}>
                {localidad.nombre}
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

        <div style={{ display: "grid", gap: "0.5rem" }}>
          <p style={{ margin: 0, fontWeight: 500 }}>
            Imágenes actuales ({totalImagenes}/{MAX_IMAGENES_PUBLICACION})
          </p>
          {imagenesActuales.length ? (
            <div style={previewGridStyle}>
              {imagenesActuales.map((url, index) => (
                <div key={url} style={previewItemStyle}>
                  <div style={{ position: "relative", width: "100%", height: 100 }}>
                    <RemoteImage src={url} alt={`Imagen ${index + 1}`} fill loading="eager" />
                  </div>
                  <button
                    type="button"
                    onClick={() => quitarImagenActual(index)}
                    style={removeButtonStyle}
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280", margin: 0 }}>No quedan imágenes guardadas.</p>
          )}
        </div>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          URLs de imagen (opcional, una por línea)
          <textarea
            value={urlsImagen}
            onChange={(e) => setUrlsImagen(e.target.value)}
            rows={3}
            style={inputStyle}
            placeholder={"https://...\nhttps://..."}
            disabled={totalImagenes >= MAX_IMAGENES_PUBLICACION}
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Agregar imágenes ({totalImagenes}/{MAX_IMAGENES_PUBLICACION})
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={manejarArchivos}
            style={inputStyle}
            disabled={totalImagenes >= MAX_IMAGENES_PUBLICACION}
          />
        </label>

        {previewsNuevos.length ? (
          <div style={previewGridStyle}>
            {previewsNuevos.map((preview, index) => (
              <div key={`${preview}-${index}`} style={previewItemStyle}>
                <img
                  src={preview}
                  alt={`Nueva imagen ${index + 1}`}
                  style={{
                    width: "100%",
                    height: 100,
                    objectFit: "cover",
                    borderRadius: "0.75rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => quitarArchivoNuevo(index)}
                  style={removeButtonStyle}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
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

const previewGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: "0.75rem",
};

const previewItemStyle: React.CSSProperties = {
  display: "grid",
  gap: "0.35rem",
};

const removeButtonStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: "999px",
  padding: "0.25rem 0.5rem",
  background: "white",
  cursor: "pointer",
  fontSize: "0.85rem",
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
