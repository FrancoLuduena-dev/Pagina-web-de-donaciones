"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginRequest, persistSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginRequest({
        correo: correo.trim(),
        contraseña,
      });
      persistSession(data);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-[var(--color-fondo)] px-4 py-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-texto-principal)]">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-[var(--color-texto-secundario)]">
            Accedé a tu cuenta para seguir donando.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-[var(--color-borde)] bg-[var(--color-tarjeta)] p-6 shadow-sm"
        >
          <div className="space-y-1">
            <label htmlFor="correo" className="text-sm font-medium text-[var(--color-texto-principal)]">
              Correo
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-tarjeta)] px-3 py-2 text-sm text-[var(--color-texto-principal)] outline-none ring-[var(--color-primario)] focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="contraseña" className="text-sm font-medium text-[var(--color-texto-principal)]">
              Contraseña
            </label>
            <input
              id="contraseña"
              name="contraseña"
              type="password"
              autoComplete="current-password"
              required
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-tarjeta)] px-3 py-2 text-sm text-[var(--color-texto-principal)] outline-none ring-[var(--color-primario)] focus:ring-2"
            />
          </div>

          {error ? (
            <p
              className="text-sm text-[var(--color-alertas)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 bg-[var(--color-primario)] hover:bg-[var(--color-primario-hover)]"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-texto-secundario)]">
          <Link
            href="/"
            className="underline underline-offset-4 hover:opacity-80 text-[var(--color-primario)]"
          >
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
