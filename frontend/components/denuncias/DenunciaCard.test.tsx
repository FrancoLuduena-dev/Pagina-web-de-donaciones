import { render, screen } from "@testing-library/react";

import DenunciaCard from "./DenunciaCard";
import { fireEvent } from "@testing-library/react";

describe("DenunciaCard", () => {
  const denunciaMock = {
    id: "1",
    publicacionId: "2",
    denuncianteId: "3",
    creadorPublicacionId: "4",
    moderadorAsignadoId: null,
    motivo: "SPAM",
    comentario: "Comentario de prueba",
    estado: "pendiente",
    tipoResolucion: null,
    fechaCreacion: "2026-06-23T12:00:00.000Z",
    fechaActualizacion: "2026-06-23T12:00:00.000Z",
    version: 1,
  };

  it("muestra motivo, comentario y estado", () => {
    render(
      <DenunciaCard
        denuncia={denunciaMock}
      />,
    );

    expect(
      screen.getByText("SPAM"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Comentario de prueba",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("pendiente"),
    ).toBeInTheDocument();
  });

  it("muestra la resolución cuando existe", () => {
    render(
      <DenunciaCard
        denuncia={{
          ...denunciaMock,
          estado: "RESUELTA",
          tipoResolucion:
            "PUBLICACION_PAUSADA",
        }}
      />,
    );

    expect(
      screen.getByText(
        /PUBLICACION_PAUSADA/,
      ),
    ).toBeInTheDocument();
  });

  it("no muestra resolución cuando no existe", () => {
    render(
      <DenunciaCard
        denuncia={denunciaMock}
      />,
    );

    expect(
      screen.queryByText(/Resolución:/),
    ).not.toBeInTheDocument();
  });

  it("ejecuta onTomar al hacer click", () => {
    const onTomar = jest.fn();

    render(
      <DenunciaCard
        denuncia={denunciaMock}
        mostrarBotonTomar
        onTomar={onTomar}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Tomar denuncia",
      }),
    );

    expect(onTomar).toHaveBeenCalledTimes(1);
  });

  it("muestra el motivo formateado", () => {
  render(
    <DenunciaCard
      denuncia={{
        ...denunciaMock,
        motivo: "PUBLICACION_FALSA",
      }}
    />,
  );

  expect(
    screen.getByText(
      "Publicación falsa",
    ),
  ).toBeInTheDocument();
});

it("muestra el estado formateado", () => {
  render(
    <DenunciaCard
      denuncia={{
        ...denunciaMock,
        estado: "EN_REVISION",
      }}
    />,
  );

  expect(
    screen.getByText(
      "En revisión",
    ),
  ).toBeInTheDocument();
});

it("mantiene el texto original para motivos desconocidos", () => {
  render(
    <DenunciaCard
      denuncia={{
        ...denunciaMock,
        motivo: "MOTIVO_DESCONOCIDO",
      }}
    />,
  );

  expect(
    screen.getByText(
      "MOTIVO_DESCONOCIDO",
    ),
  ).toBeInTheDocument();
});

it("mantiene el texto original para estados desconocidos", () => {
  render(
    <DenunciaCard
      denuncia={{
        ...denunciaMock,
        estado: "ESTADO_DESCONOCIDO",
      }}
    />,
  );

  expect(
    screen.getByText(
      "ESTADO_DESCONOCIDO",
    ),
  ).toBeInTheDocument();
});
});