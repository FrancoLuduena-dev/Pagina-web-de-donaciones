"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CATEGORIA_IDS,
  CONDICIONES_OBJETO,
  LOCALIDAD_ID_DEFAULT,
  MAX_IMAGENES_PUBLICACION,
  type CondicionObjeto,
} from "@/constants/publicacionesBackend";
import {
  LOCALIDADES_VICENTE_LOPEZ,
  MUNICIPIO_VICENTE_LOPEZ,
} from "@/constants/localidadesVicenteLopez";
import {
  crearPublicacionRequest,
  subirImagenesPublicacionRequest,
} from "@/lib/publicaciones";
import { CategoriaPublicacion } from "@/types/CategoriaPublicacion";

function parseUrlsTexto(texto: string): string[] {
  return texto
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);
}

export default function CrearPublicacionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: CategoriaPublicacion.INDUMENTARIA,
    condicion: "USADO_BUENO" as CondicionObjeto,
    localidadId: LOCALIDAD_ID_DEFAULT,
    urlsImagen: "",
  });
  const [archivosImagen, setArchivosImagen] = useState<File[]>([]);
  const [previewsArchivos, setPreviewsArchivos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const manejarArchivos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const combinados = [...archivosImagen, ...files].slice(0, MAX_IMAGENES_PUBLICACION);
    setArchivosImagen(combinados);

    combinados.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewsArchivos((prev) => {
          const next = [...prev];
          next[index] = String(reader.result ?? "");
          return next;
        });
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const quitarArchivo = (index: number) => {
    setArchivosImagen((prev) => prev.filter((_, i) => i !== index));
    setPreviewsArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const guardar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setGuardando(true);

    try {
      const urlsManuales = parseUrlsTexto(form.urlsImagen);
      const urlsSubidas =
        archivosImagen.length > 0
          ? await subirImagenesPublicacionRequest(archivosImagen)
          : [];

      const imagenUrls = [...urlsSubidas, ...urlsManuales];

      if (!imagenUrls.length) {
        throw new Error("Subí al menos una imagen o ingresá una URL.");
      }

      if (imagenUrls.length > MAX_IMAGENES_PUBLICACION) {
        throw new Error(`Podés agregar hasta ${MAX_IMAGENES_PUBLICACION} imágenes.`);
      }

      const creada = await crearPublicacionRequest({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        categoriaId: CATEGORIA_IDS[form.categoria],
        localidadId: form.localidadId,
        condicion: form.condicion,
        imagenUrls,
      });

      router.push(`/publicaciones/publicacion/${creada.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la publicación.");
    } finally {
      setGuardando(false);
    }
  };

  const urlsManualesCount = parseUrlsTexto(form.urlsImagen).length;
  const totalImagenes = archivosImagen.length + urlsManualesCount;

  return (
    <main style={{ padding: "2rem", maxWidth: 760, margin: "0 auto" }}>
      <h1>Crear publicación</h1>
      <p style={{ color: "#4b5563", marginBottom: "1rem" }}>
        Podés subir hasta {MAX_IMAGENES_PUBLICACION} imágenes. Tenés que estar logueado.
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
            minLength={4}
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
            minLength={20}
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

        <label style={{ display: "grid", gap: "0.25rem" }}>
          URLs de imagen (opcional, una por línea)
          <textarea
            value={form.urlsImagen}
            onChange={(e) => setForm({ ...form, urlsImagen: e.target.value })}
            rows={3}
            style={inputStyle}
            placeholder={"https://...\nhttps://..."}
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Subir imágenes ({totalImagenes}/{MAX_IMAGENES_PUBLICACION})
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={manejarArchivos}
            style={inputStyle}
            disabled={totalImagenes >= MAX_IMAGENES_PUBLICACION}
          />
        </label>

        {previewsArchivos.length ? (
          <div style={previewGridStyle}>
            {previewsArchivos.map((preview, index) => (
              <div key={`${preview}-${index}`} style={previewItemStyle}>
                <Image
                  src={preview}
                  alt={`Vista previa ${index + 1}`}
                  width={140}
                  height={100}
                  style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: "0.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => quitarArchivo(index)}
                  style={removeButtonStyle}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div style={actionsStyle}>
          <Link href="/publicaciones" style={exitButtonStyle}>
            Salir
          </Link>
          <button type="submit" style={buttonStyle} disabled={guardando}>
            {guardando ? "Publicando..." : "Publicar"}
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
