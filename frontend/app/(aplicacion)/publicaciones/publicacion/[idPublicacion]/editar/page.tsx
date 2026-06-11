"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { publicacionesDestacadas } from "@/lib/mockPublicaciones";

export default function EditarPublicacionPage() {
  const params = useParams<{ idPublicacion: string }>();

  const publicacion = useMemo(
    () => publicacionesDestacadas.find((item) => item.idPublicacion === params.idPublicacion),
    [params.idPublicacion],
  );

  const [form, setForm] = useState({
    titulo: publicacion?.tituloPublicacion ?? "",
    descripcion: publicacion?.descripcionPublicacion ?? "",
    categoria: publicacion?.categoria ?? "",
    zonaRetiro: publicacion?.zonaRetiro ?? "",
  });
  const [imagenPreview, setImagenPreview] = useState<string>(publicacion?.urlFoto ?? "");
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

    console.log("Editar publicación (FormData)", Object.fromEntries(formData.entries()));
    alert("Formulario de edición preparado para subir archivos al backend.");
  };

  if (!publicacion) {
    return <main style={{ padding: "2rem" }}>Publicación no encontrada.</main>;
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 760, margin: "0 auto" }}>
      <h1>Editar publicación</h1>
      <p style={{ color: "#4b5563", marginBottom: "1rem" }}>
        Este paso queda preparado para enlazar con la API real cuando el backend esté disponible.
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
          <input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={inputStyle} />
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
          <img src={imagenPreview} alt="Vista previa" style={{ width: "100%", maxWidth: 320, borderRadius: "1rem", objectFit: "cover" }} />
        ) : null}

        <button type="submit" style={buttonStyle}>Guardar cambios</button>
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

const buttonStyle: React.CSSProperties = {
  width: "fit-content",
  padding: "0.75rem 1rem",
  borderRadius: "999px",
  border: "none",
  background: "#1f6feb",
  color: "white",
  cursor: "pointer",
};
