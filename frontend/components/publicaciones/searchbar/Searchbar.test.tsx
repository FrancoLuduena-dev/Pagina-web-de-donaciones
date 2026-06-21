import { fireEvent, render, screen } from "@testing-library/react";
import Searchbar from "./Searchbar";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("Searchbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el input de búsqueda", () => {
    render(<Searchbar />);

    expect(
      screen.getByPlaceholderText("Buscar donaciones...")
    ).toBeInTheDocument();
  });

  it("redirige a publicaciones cuando la búsqueda está vacía", () => {
    render(<Searchbar />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Buscar",
      })
    );

    expect(pushMock).toHaveBeenCalledWith(
      "/publicaciones"
    );
  });

  it("realiza una búsqueda con texto", () => {
    render(<Searchbar />);

    fireEvent.change(
      screen.getByPlaceholderText("Buscar donaciones..."),
      {
        target: {
          value: "ropa",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Buscar",
      })
    );

    expect(pushMock).toHaveBeenCalledWith(
      "/publicaciones?q=ropa"
    );
  });

  it("elimina espacios al inicio y al final de la búsqueda", () => {
    render(<Searchbar />);

    fireEvent.change(
      screen.getByPlaceholderText("Buscar donaciones..."),
      {
        target: {
          value: "   muebles   ",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Buscar",
      })
    );

    expect(pushMock).toHaveBeenCalledWith(
      "/publicaciones?q=muebles"
    );
  });

  it("codifica caracteres especiales", () => {
    render(<Searchbar />);

    fireEvent.change(
      screen.getByPlaceholderText("Buscar donaciones..."),
      {
        target: {
          value: "mesa y sillas",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Buscar",
      })
    );

    expect(pushMock).toHaveBeenCalledWith(
      "/publicaciones?q=mesa%20y%20sillas"
    );
  });
});