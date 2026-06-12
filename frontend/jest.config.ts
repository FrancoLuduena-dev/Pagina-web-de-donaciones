// Importa el helper oficial de Next.js para integrar Jest correctamente
// Esto adapta automáticamente Jest a cómo funciona Next (SWC, rutas, CSS, etc.)
import nextJest from 'next/jest'

// Importa el tipo de configuración de Jest (solo para TypeScript)
import type { Config } from 'jest'


// Creamos una función que genera la configuración de Jest adaptada a Next.js
// "dir: './'" le dice dónde está la raíz del proyecto
const createJestConfig = nextJest({
  dir: './',
})


/**
 * Configuración principal de Jest
 * Aquí definimos cómo se van a ejecutar los tests
 */
const config: Config = {

  // 🌐 Define el entorno de testing
  // "jsdom" simula un navegador dentro de Node.js
  // Necesario para React (DOM, window, document, etc.)
  testEnvironment: 'jsdom',


  // 🧹 Limpia automáticamente los mocks entre tests
  // Evita que un test afecte a otro
  clearMocks: true,


  // 📊 Activa la recolección de cobertura de código
  // Muestra cuánto del código está siendo testeado
  collectCoverage: true,


  // ⚡ Motor usado para medir coverage
  // "v8" es el engine moderno de Node.js (más rápido que babel)
  coverageProvider: 'v8',


  // 📁 Carpeta donde se guardan los reportes de coverage
  coverageDirectory: 'coverage',


  // 🧪 Archivos que se ejecutan antes de los tests
  // Aquí se suele importar jest-dom u otras configuraciones globales
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],


  // 🧭 Permite usar alias tipo "@/"
  // Ejemplo: import Button from '@/components/Button'
  // Esto le dice a Jest cómo resolver esas rutas
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}


/**
 * Exportamos la configuración final
 * nextJest la envuelve para que funcione correctamente con Next.js
 */
export default createJestConfig(config)