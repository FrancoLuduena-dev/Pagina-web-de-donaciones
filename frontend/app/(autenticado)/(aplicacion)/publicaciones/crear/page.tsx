"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CATEGORIA_IDS,
  CONDICIONES_OBJETO,
  LOCALIDAD_ID_DEFAULT,
  type CondicionObjeto,
} from "@/constants/publicacionesBackend";
import { crearPublicacionRequest, subirImagenPublicacionRequest } from "@/lib/publicaciones";
import { CategoriaPublicacion } from "@/types/CategoriaPublicacion";

export default function CrearPublicacionPage() {
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
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

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

      if (!imagenUrl) {
        throw new Error("Subí una imagen o ingresá una URL de imagen.");
      }

      const creada = await crearPublicacionRequest({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        categoriaId: CATEGORIA_IDS[form.categoria],
        localidadId: LOCALIDAD_ID_DEFAULT,
        condicion: form.condicion,
        imagenUrl,
      });

      router.push(`/publicaciones/publicacion/${creada.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la publicación.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: 760, margin: "0 auto" }}>
      <h1>Crear publicación</h1>
      <p style={{ color: "#4b5563", marginBottom: "1rem" }}>
        La publicación se guarda en el backend. Tenés que estar logueado.
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
            minLength={10}
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
            onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })}
            style={inputStyle}
            placeholder="https://..."
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Subir imagen
          <input type="file" accept="image/*" onChange={manejarArchivo} style={inputStyle} />
        </label>

        {imagenPreview ? (
          <Image
            src={imagenPreview}
            alt="Vista previa"
            width={320}
            height={220}
            style={{
              width: "100%",
              maxWidth: 320,
              borderRadius: "1rem",
              objectFit: "cover",
            }}
          />
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
