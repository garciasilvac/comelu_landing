import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { HeroNotifications } from "./HeroNotifications";

describe("HeroNotifications", () => {
  it("opens three illustrative notifications from the bell", async () => {
    const user = userEvent.setup();
    render(<HeroNotifications />);

    const bell = screen.getByRole("button", { name: "3 notificaciones" });
    expect(bell).toBeVisible();

    await user.hover(bell);

    expect(await screen.findByText("Notificaciones")).toBeVisible();
    expect(screen.getByText("Entrega programada hoy")).toBeVisible();
    expect(screen.getByText("Orden pendiente de iniciar")).toBeVisible();
    expect(screen.getByText("Pago pendiente")).toBeVisible();
  });

  it("opens the same popover by click for touch and keyboard users", async () => {
    const user = userEvent.setup();
    render(<HeroNotifications />);

    await user.click(screen.getByRole("button", { name: "3 notificaciones" }));

    expect(await screen.findByText("Notificaciones")).toBeVisible();
  });
});
