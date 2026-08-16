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
  });

  it("moves one shared selection indicator with the controlled tab", async () => {
    const user = userEvent.setup();
    const { container } = render(<HeroSection onWaitlist={vi.fn()} onProblems={vi.fn()} />);
    const tabsList = screen.getByRole("tablist", { name: "Explorar Comelu" });

    expect(tabsList).toHaveStyle({ "--hero-tab-index": "1" });
    expect(tabsList).toHaveStyle({ "--hero-tab-translate": "100%" });
    expect(container.querySelectorAll(".hero-tabs-indicator")).toHaveLength(1);
    expect(container.querySelector(".hero-kpi")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Producción" }));

    expect(tabsList).toHaveStyle({ "--hero-tab-index": "2" });
    expect(tabsList).toHaveStyle({ "--hero-tab-translate": "200%" });
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
