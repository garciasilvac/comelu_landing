import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HeroSection } from "./HeroSection";

describe("HeroSection", () => {
  it("presents the product-first hierarchy and accessible tabs", () => {
    render(<HeroSection onWaitlist={vi.fn()} onProblems={vi.fn()} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Toda la operación de tu laboratorio dental, en un solo lugar.",
      }),
    ).toBeVisible();
    expect(screen.getByText("Software para laboratorios dentales en Chile")).toBeVisible();
    expect(screen.getByRole("tablist", { name: "Explorar Comelu" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Órdenes" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("Dato ilustrativo: 18 órdenes de trabajo activas")).toBeVisible();
    expect(screen.getByLabelText("Dato ilustrativo: 3 entregas programadas para hoy")).toBeVisible();
  });

  it("keeps both existing conversion callbacks", async () => {
    const user = userEvent.setup();
    const onWaitlist = vi.fn();
    const onProblems = vi.fn();
    render(<HeroSection onWaitlist={onWaitlist} onProblems={onProblems} />);

    await user.click(screen.getByRole("button", { name: "Unirme a la lista de espera" }));
    await user.click(screen.getByRole("button", { name: "Ver qué buscamos resolver" }));

    expect(onWaitlist).toHaveBeenCalledOnce();
    expect(onProblems).toHaveBeenCalledOnce();
  });
});
