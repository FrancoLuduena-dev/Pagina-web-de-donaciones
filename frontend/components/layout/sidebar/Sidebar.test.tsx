import { fireEvent, render, screen } from "@testing-library/react";
import Sidebar from "./Sidebar";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/publicaciones",
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra las categorias principales", () => {
    render(<Sidebar />);

    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByText("Indumentaria")).toBeInTheDocument();
    expect(screen.getByText("Muebles")).toBeInTheDocument();
    expect(screen.getByText("Alimentos")).toBeInTheDocument();
    expect(screen.getByText("Otros")).toBeInTheDocument();
  });

  it("cambia el filtro de condicion", () => {
    render(<Sidebar />);

    fireEvent.change(
      screen.getByLabelText("Condición:"),
      {
        target: {
          value: "NUEVO",
        },
      }
    );

    expect(pushMock).toHaveBeenCalledWith(
      "/publicaciones?condicion=NUEVO"
    );
  });

  it("elimina el filtro de condicion", () => {
  render(<Sidebar />);

  fireEvent.change(
    screen.getByLabelText("Condición:"),
    {
      target: {
        value: "",
      },
    }
  );

  expect(pushMock).toHaveBeenCalled();
});

  it("cambia el filtro de estado", () => {
    render(<Sidebar />);

    fireEvent.change(
      screen.getByLabelText("Estado:"),
      {
        target: {
          value: "PAUSADA",
        },
      }
    );

    expect(pushMock).toHaveBeenCalledWith(
      "/publicaciones?estado=PAUSADA"
    );
  });

  it("abre y cierra el menu movil", () => {
    render(<Sidebar />);

    const boton = screen.getByRole("button", {
      name: /categorías/i,
    });

    fireEvent.click(boton);
    fireEvent.click(boton);

    expect(boton).toBeInTheDocument();
  });
it("renderiza la categoria indumentaria como activa", () => {
  jest.spyOn(require("next/navigation"), "usePathname")
    .mockReturnValue("/publicaciones/indumentaria");

  render(<Sidebar />);

  expect(
    screen.getByRole("link", { name: /indumentaria/i })
  ).toBeInTheDocument();
});

it("renderiza la categoria muebles como activa", () => {
  jest.spyOn(require("next/navigation"), "usePathname")
    .mockReturnValue("/publicaciones/muebles");

  render(<Sidebar />);

  expect(
    screen.getByRole("link", { name: /muebles/i })
  ).toBeInTheDocument();
});

it("renderiza la categoria alimentos como activa", () => {
  jest.spyOn(require("next/navigation"), "usePathname")
    .mockReturnValue("/publicaciones/alimentos");

  render(<Sidebar />);

  expect(
    screen.getByRole("link", { name: /alimentos/i })
  ).toBeInTheDocument();
});

it("renderiza la categoria otros como activa", () => {
  jest.spyOn(require("next/navigation"), "usePathname")
    .mockReturnValue("/publicaciones/otros");

  render(<Sidebar />);

  expect(
    screen.getByRole("link", { name: /otros/i })
  ).toBeInTheDocument();
});
});