export type LoginPayload = {
  correo: string;
  contraseña: string;
};

export type LoginResponse = {
  access_token?: string;
  accessToken?: string;
  user?: unknown;
  message?: string;
};

export async function loginRequest(
  payload: LoginPayload
): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: LoginResponse = {};
  try {
    data = (await res.json()) as LoginResponse;
  } catch {
    /* cuerpo vacío o no JSON */
  }

  if (!res.ok) {
    const msg =
      data.message ||
      (res.status === 401
        ? "Correo o contraseña incorrectos."
        : `Error al iniciar sesión (${res.status}).`);
    throw new Error(msg);
  }

  return data;
}

export function persistSession(data: LoginResponse): void {
  const token = data.access_token ?? data.accessToken;
  if (token && typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
}
