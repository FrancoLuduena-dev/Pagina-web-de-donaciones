import { render, screen } from "@testing-library/react";
import Footer from "./Footer";
import { email } from "@/constants/site";

describe("Footer", () => {
    it("muestra el texto de copyright", () => {
        render(<Footer />);

        expect(
            screen.getByText("© 2026 Todos los derechos reservados.")
        ).toBeInTheDocument();
    });

    it("muestra el enlace Sobre Nosotros", () => {
        render(<Footer />);

        const enlace = screen.getByRole("link", {
            name: "Sobre Nosotros",
        });

        expect(enlace).toBeInTheDocument();
        expect(enlace).toHaveAttribute("href", "/about");
    });

    it("muestra el enlace Contactanos", () => {
        render(<Footer />);

        const linkContacto = screen.getByRole("link", {
            name: /contactanos/i,
        });

        expect(linkContacto).toHaveAttribute(
            "href",
            `mailto:${email}`,
        );

    });
});