import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-1 flex-col justify-center bg-[var(--color-fondo)] px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-texto-principal)]">
        Plataforma de donaciones
      </h1>
      <p className="mt-4 text-[var(--color-texto-secundario)]">
        Sumá tu granito de arena. Pronto vas a poder explorar campañas y donar
        desde acá.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/login"
          className="inline-flex rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 bg-[var(--color-primario)] hover:bg-[var(--color-primario-hover)]"
        >
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}

