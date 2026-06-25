export class MockNextResponse {
  status: number;
  headers: Map<string, string>;
  private body: string;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = typeof body === "string" ? body : "";
    this.status = init?.status ?? 200;
    this.headers = new Map(
      Object.entries((init?.headers as Record<string, string>) ?? {}),
    );
  }

  async text() {
    return this.body;
  }

  async json() {
    return this.body ? JSON.parse(this.body) : null;
  }

  static json(body: unknown, init?: { status?: number }) {
    return {
      status: init?.status ?? 200,
      json: async () => body,
    };
  }
}
