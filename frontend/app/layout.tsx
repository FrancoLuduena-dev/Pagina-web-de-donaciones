import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from 'next';
import { tituloPagina } from "@/constants/site";


export const metadata: Metadata = {
  title: tituloPagina,
  description: 'Pagina para publicar donaciones de ropa, comida, etc.'
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * Configuración para la fuente Geist Sans-Serif.
 * Crea la variable CSS de fuente la fuente principal  `--font-geist-sans`.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Configuración para la fuente Geist Monoespaciada.
 * Inyecta la variable CSS de la fuente secundaria `--font-geist-mono`.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


/** Layout principal que define la estructura base de la aplicación. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" >
      <body className={`${geistSans.variable} ${geistMono.variable} app-root`}>{children}</body>
    </html>
  );
}

