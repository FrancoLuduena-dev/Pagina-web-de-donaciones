import { fireEvent, render, screen } from "@testing-library/react";
import BuscadorUsuario from "./BuscadorUsuario";

describe("BuscadorUsuario", () => {
  it("renderiza el input y el botón", () => {
    render(
      <BuscadorUsuario
        nombreUsuario=""
        setNombreUsuario={jest.fn()}
        onBuscar={jest.fn()}
      />
    );

    expect(
      screen.getByLabelText(/nombre de usuario/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /buscar usuario/i,
      })
    ).toBeInTheDocument();
  });

  it("llama a setNombreUsuario cuando cambia el input", () => {
    const setNombreUsuario = jest.fn();

    render(
      <BuscadorUsuario
        nombreUsuario=""
        setNombreUsuario={setNombreUsuario}
        onBuscar={jest.fn()}
      />
    );

    fireEvent.change(
      screen.getByLabelText(/nombre de usuario/i),
      {
        target: {
          value: "juan",
        },
      }
    );

    expect(setNombreUsuario).toHaveBeenCalledWith(
      "juan"
    );
  });

  it("llama a onBuscar al enviar el formulario", () => {
    const onBuscar = jest.fn();

    render(
      <BuscadorUsuario
        nombreUsuario="juan"
        setNombreUsuario={jest.fn()}
        onBuscar={onBuscar}
      />
    );

    fireEvent.submit(
      screen.getByRole("button", {
        name: /buscar usuario/i,
      })
    );

    expect(onBuscar).toHaveBeenCalledTimes(1);
  });

  it("llama a onBuscar al hacer click en el botón", () => {
    const onBuscar = jest.fn();

    render(
      <BuscadorUsuario
        nombreUsuario="juan"
        setNombreUsuario={jest.fn()}
        onBuscar={onBuscar}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /buscar usuario/i,
      })
    );

    expect(onBuscar).toHaveBeenCalledTimes(1);
  });
});