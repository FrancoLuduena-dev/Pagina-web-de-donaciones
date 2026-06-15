"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CategoriaPublicacion } from "@/types/CategoriaPublicacion";

export default function CrearPublicacionPage() {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: CategoriaPublicacion.INDUMENTARIA,
    zonaRetiro: "",
  });
  const [imagenPreview, setImagenPreview] = useState<string>("");
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);

  const manejarArchivo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setArchivoImagen(file);
    const reader = new FileReader();
    reader.onload = () => setImagenPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const guardar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("titulo", form.titulo);
    formData.append("descripcion", form.descripcion);
    formData.append("categoria", form.categoria);
    formData.append("zonaRetiro", form.zonaRetiro);

    if (archivoImagen) {
      formData.append("imagen", archivoImagen);
    }

    console.log("Crear publicación (FormData)", Object.fromEntries(formData.entries()));
    alert("Formulario de creación preparado para subir archivos al backend.");
  };

  return (
    <main style={{ padding: "2rem", maxWidth: 760, margin: "0 auto" }}>
      <h1>Crear publicación</h1>
      <p style={{ color: "#4b5563", marginBottom: "1rem" }}>
        Este primer paso queda preparado para integrar el POST real cuando el backend esté listo.
      </p>

      <form onSubmit={guardar} style={{ display: "grid", gap: "0.9rem" }}>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Título
          <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} style={inputStyle} />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Descripción
          <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={4} style={inputStyle} />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Categoría
          <select
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaPublicacion })}
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
          Zona de retiro
          <input value={form.zonaRetiro} onChange={(e) => setForm({ ...form, zonaRetiro: e.target.value })} style={inputStyle} />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Foto de la publicación
          <input type="file" accept="image/*" onChange={manejarArchivo} style={inputStyle} />
        </label>

        {imagenPreview ? (
          <Image src={imagenPreview} alt="Vista previa" width={320} height={220} style={{ width: "100%", maxWidth: 320, borderRadius: "1rem", objectFit: "cover" }} />
        ) : null}

        <div style={actionsStyle}>
          <Link href="/publicaciones" style={exitButtonStyle}>
            Salir
          </Link>
          <button type="submit" style={buttonStyle}>Publicar</button>
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
