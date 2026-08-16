import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("Comelu landing", () => {
  it("uses the shared Comelu logo on matching sky navbar and footer surfaces", () => {
    render(<App />);

    const logos = screen.getAllByRole("img", { name: "Comelu" });
    expect(logos).toHaveLength(3);
    logos.forEach((logo) => expect(logo).toHaveAttribute("src", "/comelu-horizontal.svg"));
    expect(screen.getByRole("banner")).toHaveClass("bg-sky-700");
    expect(screen.getByRole("contentinfo")).toHaveClass("bg-sky-700");
  });

  it("opens mobile navigation as a named modal surface", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    expect(screen.getByRole("dialog", { name: "Navegación" })).toBeVisible();
  });

  it("preserves the landing content and form contract", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Toda la operación de tu laboratorio dental, en un solo lugar.",
      }),
    ).toBeVisible();
    expect(screen.queryByText("El Software que cambiará la gestión del laboratorio dental")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Nombre" })).toBeRequired();
    expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired();
    expect(screen.getByRole("combobox", { name: "Rol" })).toBeRequired();
    expect(document.querySelector("#que-resuelve")).toBeInTheDocument();
    expect(document.querySelector("#para-quien")).toBeInTheDocument();
    expect(document.querySelector("#lista-espera")).toBeInTheDocument();
    expect(document.querySelector("#faq")).toBeInTheDocument();
  });

  it("switches product previews through accessible shadcn tabs", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: "Producción" }));

    expect(screen.getByText("Por iniciar")).toBeVisible();
    expect(screen.getAllByText("Control de calidad")[0]).toBeVisible();
  });

  it("shows accessible validation when the required form is empty", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Quiero unirme a la lista de espera" }));

    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getAllByText("El nombre debe tener al menos 2 letras.")[0]).toBeVisible();
  });

  it("limits interest selection to three choices", async () => {
    const user = userEvent.setup();
    render(<App />);
    const choices = [
      screen.getByRole("checkbox", { name: "Gestión de órdenes de trabajo" }),
      screen.getByRole("checkbox", { name: "Archivos y documentos por caso" }),
      screen.getByRole("checkbox", { name: "Estados y seguimiento operativo" }),
      screen.getByRole("checkbox", { name: "Pagos, saldos y comprobantes" }),
    ];

    await user.click(choices[0]);
    await user.click(choices[1]);
    await user.click(choices[2]);

    expect(choices[3]).toHaveAttribute("aria-disabled", "true");
  });

  it("keeps only one FAQ answer expanded", async () => {
    const user = userEvent.setup();
    render(<App />);
    const first = screen.getByRole("button", { name: "¿Qué es Comelu?" });
    const second = screen.getByRole("button", { name: "¿Para quién está pensado?" });

    expect(first).toHaveAttribute("aria-expanded", "true");
    await user.click(second);

    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });
});
