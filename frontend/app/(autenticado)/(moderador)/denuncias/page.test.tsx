import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import PaginaDenuncias from "./page";

import {
  obtenerDenuncias,
  tomarDenuncia,
  resolverDenuncia,
} from "@/lib/denuncias";

jest.mock("@/lib/denuncias", () => ({
  obtenerDenuncias: jest.fn(),
  tomarDenuncia: jest.fn(),
  resolverDenuncia: jest.fn(),
}));

jest.mock(
  "@/components/denuncias/DenunciaCard",
  () => ({
    __esModule: true,
    default: ({
      denuncia,
      mostrarBotonTomar,
      mostrarBotonResolver,
      onTomar,
      onResolver,
    }: any) => (
      <div>
        <span>{denuncia.motivo}</span>

        {mostrarBotonTomar && (
          <button onClick={onTomar}>
            Tomar
          </button>
        )}

        {mostrarBotonResolver && (
          <button onClick={onResolver}>
            Resolver
          </button>
        )}
      </div>
    ),
  }),
);

const alertMock = jest.fn();

beforeAll(() => {
  window.alert = alertMock;
});

describe("PaginaDenuncias", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Storage.prototype.getItem =
      jest.fn(() => "token-falso");

    global.fetch = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "moderador-1",
          rol: "usuarioModerador",
        }),
      });
  });

  it(
    "muestra denuncias disponibles y asignadas",
    async () => {
      (
        obtenerDenuncias as jest.Mock
      ).mockResolvedValue([
        {
          id: "1",
          motivo:
            "PUBLICACION_FALSA",
          estado: "PENDIENTE",
          version: 1,
        },
        {
          id: "2",
          motivo:
            "CONTENIDO_INAPROPIADO",
          estado:
            "EN_REVISION",
          version: 1,
          moderadorAsignadoId:
            "moderador-1",
        },
      ]);

      render(<PaginaDenuncias />);

      expect(
        await screen.findByText(
          "Denuncias disponibles",
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Mis denuncias",
        ),
      ).toBeInTheDocument();
    },
  );

  it(
    "abre el formulario de resolución",
    async () => {
      (
        obtenerDenuncias as jest.Mock
      ).mockResolvedValue([
        {
          id: "2",
          motivo:
            "CONTENIDO_INAPROPIADO",
          estado:
            "EN_REVISION",
          version: 1,
          moderadorAsignadoId:
            "moderador-1",
        },
      ]);

      render(<PaginaDenuncias />);

      fireEvent.click(
        await screen.findByText(
          "Resolver",
        ),
      );

      expect(
        screen.getByText(
          "Resolver denuncia",
        ),
      ).toBeInTheDocument();
    },
  );

  it(
    "cierra el formulario al cancelar",
    async () => {
      (
        obtenerDenuncias as jest.Mock
      ).mockResolvedValue([
        {
          id: "2",
          motivo:
            "CONTENIDO_INAPROPIADO",
          estado:
            "EN_REVISION",
          version: 1,
          moderadorAsignadoId:
            "moderador-1",
        },
      ]);

      render(<PaginaDenuncias />);

      fireEvent.click(
        await screen.findByText(
          "Resolver",
        ),
      );

      fireEvent.click(
        screen.getByText(
          "Cancelar",
        ),
      );

      await waitFor(() => {
        expect(
          screen.queryByText(
            "Resolver denuncia",
          ),
        ).not.toBeInTheDocument();
      });
    },
  );

  it(
    "muestra mensajes vacíos cuando no hay denuncias",
    async () => {
      (
        obtenerDenuncias as jest.Mock
      ).mockResolvedValue([]);

      render(<PaginaDenuncias />);

      expect(
        await screen.findByText(
          "No hay denuncias disponibles.",
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "No tienes denuncias asignadas.",
        ),
      ).toBeInTheDocument();
    },
  );

  it(
    "muestra la vista de administrador",
    async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue({
          ok: true,
          json: async () => ({
            id: "admin-1",
            rol:
              "usuarioAdministrador",
          }),
        });

      (
        obtenerDenuncias as jest.Mock
      ).mockResolvedValue([]);

      render(<PaginaDenuncias />);

      expect(
        await screen.findByText(
          "Todas las denuncias",
        ),
      ).toBeInTheDocument();
    },
  );

  it(
    "permite tomar una denuncia",
    async () => {
      (
        obtenerDenuncias as jest.Mock
      )
        .mockResolvedValueOnce([
          {
            id: "1",
            motivo:
              "PUBLICACION_FALSA",
            estado:
              "PENDIENTE",
            version: 1,
          },
        ])
        .mockResolvedValueOnce([]);

      render(<PaginaDenuncias />);

      fireEvent.click(
        await screen.findByText(
          "Tomar",
        ),
      );

      await waitFor(() => {
        expect(
          tomarDenuncia,
        ).toHaveBeenCalled();
      });
    },
  );
    it(
    "muestra error si no selecciona resolución",
    async () => {
      (
        obtenerDenuncias as jest.Mock
      ).mockResolvedValue([
        {
          id: "2",
          motivo:
            "CONTENIDO_INAPROPIADO",
          estado:
            "EN_REVISION",
          version: 1,
          moderadorAsignadoId:
            "moderador-1",
        },
      ]);

      render(<PaginaDenuncias />);

      fireEvent.click(
        await screen.findByText(
          "Resolver",
        ),
      );

      fireEvent.click(
        screen.getByText(
          "Confirmar resolución",
        ),
      );

      expect(
        alertMock,
      ).toHaveBeenCalledWith(
        "Debes seleccionar una resolución.",
      );
    },
  );

  it(
    "muestra error cuando el detalle es corto",
    async () => {
      (
        obtenerDenuncias as jest.Mock
      ).mockResolvedValue([
        {
          id: "2",
          motivo:
            "CONTENIDO_INAPROPIADO",
          estado:
            "EN_REVISION",
          version: 1,
          moderadorAsignadoId:
            "moderador-1",
        },
      ]);

      render(<PaginaDenuncias />);

      fireEvent.click(
        await screen.findByText(
          "Resolver",
        ),
      );

      fireEvent.change(
        screen.getByRole(
          "combobox",
        ),
        {
          target: {
            value:
              "DESCARTADA",
          },
        },
      );

      fireEvent.change(
        screen.getByRole(
          "textbox",
        ),
        {
          target: {
            value:
              "corto",
          },
        },
      );

      fireEvent.click(
        screen.getByText(
          "Confirmar resolución",
        ),
      );

      expect(
        alertMock,
      ).toHaveBeenCalledWith(
        "El detalle debe tener al menos 15 caracteres.",
      );
    },
  );

  it(
    "resuelve una denuncia correctamente",
    async () => {
      (
        obtenerDenuncias as jest.Mock
      )
        .mockResolvedValueOnce([
          {
            id: "2",
            motivo:
              "CONTENIDO_INAPROPIADO",
            estado:
              "EN_REVISION",
            version: 1,
            moderadorAsignadoId:
              "moderador-1",
          },
        ])
        .mockResolvedValueOnce([]);

      render(<PaginaDenuncias />);

      fireEvent.click(
        await screen.findByText(
          "Resolver",
        ),
      );

      fireEvent.change(
        screen.getByRole(
          "combobox",
        ),
        {
          target: {
            value:
              "DESCARTADA",
          },
        },
      );

      fireEvent.change(
        screen.getByRole(
          "textbox",
        ),
        {
          target: {
            value:
              "Detalle suficientemente largo para pasar validaciones",
          },
        },
      );

      fireEvent.click(
        screen.getByText(
          "Confirmar resolución",
        ),
      );

      await waitFor(() => {
        expect(
          resolverDenuncia,
        ).toHaveBeenCalled();
      });
    },
  );

  it(
    "muestra error cuando resolver falla",
    async () => {
      (
        resolverDenuncia as jest.Mock
      ).mockRejectedValue(
        new Error(),
      );

      (
        obtenerDenuncias as jest.Mock
      ).mockResolvedValue([
        {
          id: "2",
          motivo:
            "CONTENIDO_INAPROPIADO",
          estado:
            "EN_REVISION",
          version: 1,
          moderadorAsignadoId:
            "moderador-1",
        },
      ]);

      render(<PaginaDenuncias />);

      fireEvent.click(
        await screen.findByText(
          "Resolver",
        ),
      );

      fireEvent.change(
        screen.getByRole(
          "combobox",
        ),
        {
          target: {
            value:
              "DESCARTADA",
          },
        },
      );

      fireEvent.change(
        screen.getByRole(
          "textbox",
        ),
        {
          target: {
            value:
              "Detalle suficientemente largo para pasar validaciones",
          },
        },
      );

      fireEvent.click(
        screen.getByText(
          "Confirmar resolución",
        ),
      );

      await waitFor(() => {
        expect(
          alertMock,
        ).toHaveBeenCalledWith(
          "No se pudo resolver la denuncia.",
        );
      });
    },
  );

  it("no renderiza contenido si no hay token", async () => {
  Storage.prototype.getItem =
    jest.fn(() => null);

  render(<PaginaDenuncias />);

  await waitFor(() => {
    expect(
      screen.queryByText("Denuncias"),
    ).not.toBeInTheDocument();
  });
});

it("maneja errores al cargar denuncias", async () => {
  (
    obtenerDenuncias as jest.Mock
  ).mockRejectedValue(
    new Error("error"),
  );

  render(<PaginaDenuncias />);

  await waitFor(() => {
    expect(
      screen.queryByText(
        "Cargando denuncias...",
      ),
    ).not.toBeInTheDocument();
  });
});

it("maneja errores al tomar denuncia", async () => {
  (
    tomarDenuncia as jest.Mock
  ).mockRejectedValue(
    new Error(),
  );

  (
    obtenerDenuncias as jest.Mock
  ).mockResolvedValue([
    {
      id: "1",
      motivo:
        "PUBLICACION_FALSA",
      estado: "PENDIENTE",
      version: 1,
    },
  ]);

  render(<PaginaDenuncias />);

  fireEvent.click(
    await screen.findByText(
      "Tomar",
    ),
  );

  await waitFor(() => {
    expect(
      tomarDenuncia,
    ).toHaveBeenCalled();
  });
});

it("no muestra formulario inicialmente", async () => {
  (
    obtenerDenuncias as jest.Mock
  ).mockResolvedValue([
    {
      id: "2",
      motivo:
        "CONTENIDO_INAPROPIADO",
      estado: "EN_REVISION",
      version: 1,
      moderadorAsignadoId:
        "moderador-1",
    },
  ]);

  render(<PaginaDenuncias />);

  expect(
    screen.queryByText(
      "Resolver denuncia",
    ),
  ).not.toBeInTheDocument();
});

});