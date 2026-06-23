// Importa jest-dom, que extiende las capacidades de Jest para poder testear el DOM de forma más realista

// 🧠 ¿Qué significa esto?
// Jest por defecto NO entiende matchers como toBeInTheDocument, toBeVisible, toBeDisabled, etc.

// Este import agrega esos matchers extra para Testing Library
import "@testing-library/jest-dom";



global.Response = class {
  status: number;
  body: unknown;

  constructor(
    body?: unknown,
    init?: { status?: number }
  ) {
    this.body = body;
    this.status = init?.status ?? 200;
  }

  async json() {
    return this.body;
  }

  async text() {
    return String(this.body);
  }
} as unknown as typeof Response;