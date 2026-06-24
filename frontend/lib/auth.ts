export type LoginPayload = {
  correo: string;
  contrasenia: string;
};

export type LoginResponse = {
  accessToken: string;
  user: {
    id: number;
    correo: string;
    rol: string;
  };
};

export type RegisterPayload = {
  correo: string;
  contrasenia: string;
  nombreUsuario: string;
  nombreCompleto: string;
  numeroTelefono: string;
};

export type RegisterResponse = {
  message: string;
  
  user?: {
    id: number;
    correo: string;
    nombreUsuario: string;
  };
};

export type psResetPayload = {
  contraseniaActual: string;
  contraseniaNueva: string;
}

export type psResetResponse = {
  message?: string;
}

export type editarPerfilPayload = {
  correo?: string;
  nombreUsuario?: string;
  nombreCompleto?: string;
  numeroTelefono?: string;
}

export type editarPerfilResponse = {
  message?: string;
}

export async function loginRequest(
  payload: LoginPayload
): Promise<LoginResponse> {

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: LoginResponse;
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!res.ok) {
    const msg =
      res.status === 401
        ? "Correo o contraseña incorrectos."
        : `Error al iniciar sesión (${res.status}).`;

    throw new Error(msg);
  }

  if (!data.accessToken) {
    throw new Error("No se recibió token del servidor.");
  }

  // guardo token SOLO si fue exitoso
  localStorage.setItem("access_token", data.accessToken);

  return data;
}

export async function registerRequest(
  payload: RegisterPayload
): Promise<RegisterResponse> {

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: RegisterResponse = { message: "Error al intentar registrar la cuenta." };
  try {
    data = (await res.json()) as RegisterResponse;
  } catch {
    /* cuerpo vacío o no JSON */
    data.message = "Error al intentar registrar la cuenta.";
  }

  if (!res.ok) {
      let msg =
        data.message ||
        (res.status === 400
          ? "Formato de los campos inválido."
          : res.status === 401
          ? "Campos invalidos o correo/nombre de usuario ya registrado."
          : `Error al registrar cuenta (${res.status}).`);
      throw new Error(msg);
  }

  return data;
}

export async function resetPasswordRequest(
  payload: psResetPayload
): Promise<psResetResponse> {

  const token = localStorage.getItem("access_token");

  const res = await fetch("/api/auth/passwordReset", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  let data: psResetResponse = {};
  try {
    data = (await res.json()) as psResetResponse;
  } catch {
    /* cuerpo vacío o no JSON */
    data.message = "Error al intentar restablecer la contraseña.";
  }

  if (!res.ok) {
    let msg =
      data.message ||
      (res.status === 400
        ? "Formato de los campos inválido."
        : res.status === 401
        ? "Las contraseñas no coinciden o la contraseña actual es incorrecta."
        : `Error al actualizar la contraseña (${res.status}).`);
    
    throw new Error(msg);
  }

  return data;
}

export async function editarPerfilRequest(
  payload: Partial<editarPerfilPayload>
): Promise<editarPerfilResponse> {

  const token = localStorage.getItem("access_token");

  const res = await fetch("/api/auth/editarPerfil", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  let data: editarPerfilResponse = {};
  try {
    data = (await res.json()) as editarPerfilResponse;
  } catch {
    /* cuerpo vacío o no JSON */
    data.message = "Error al intentar actualizar el perfil.";
  }

  if (!res.ok) {
    
    let msg =
      data.message ||
      (res.status === 400
        ? "Formato de los campos inválido."
        : res.status === 401
        ? "Los datos del perfil son inválidos."
        : `Error al actualizar el perfil (${res.status}).`);
    
    throw new Error(msg);
  }

  return data;
}

export function persistSession(data: LoginResponse): void {
  const token = data.accessToken;
  if (token && typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("access_token");
}

export type UsuarioActual = {
  id: string;
  nombreUsuario: string;
  correo: string;
  rol: string;
  nombreCompleto?: string;
  estado?: string;
};

/** Devuelve el usuario logueado, `null` si no hay sesión o el token ya no es válido. */
export async function obtenerUsuarioActualRequest(): Promise<UsuarioActual | null> {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  try {
    const res = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      clearSession();
      return null;
    }

    // Backend caído o error temporal: no borrar la sesión ni lanzar error.
    if (!res.ok) {
      return null;
    }

    return (await res.json()) as UsuarioActual;
  } catch {
    return null;
  }
}
