const redirectMock = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => redirectMock(...args),
}));

import MisPublicacionesRedirectPage from "./page";

describe("MisPublicacionesRedirectPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
  });

  it("redirige al historial de publicaciones del usuario", () => {
    MisPublicacionesRedirectPage();

    expect(redirectMock).toHaveBeenCalledWith("/usuario/publicaciones");
  });
});
