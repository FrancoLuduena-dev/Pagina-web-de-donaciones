// Importa jest-dom, que extiende las capacidades de Jest para poder testear el DOM de forma más realista

// 🧠 ¿Qué significa esto?
// Jest por defecto NO entiende matchers como toBeInTheDocument, toBeVisible, toBeDisabled, etc.

// Este import agrega esos matchers extra para Testing Library
import '@testing-library/jest-dom'