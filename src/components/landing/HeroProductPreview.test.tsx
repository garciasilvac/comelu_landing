import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroProductPreview, PRODUCT_TABS } from "./HeroProductPreview";

function PreviewHarness() {
  return (
    <Tabs defaultValue="orders">
      <TabsList aria-label="Explorar Comelu">
        {PRODUCT_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <HeroProductPreview />
    </Tabs>
  );
}

describe("HeroProductPreview", () => {
  it("shows the orders preview by default and switches to payments", async () => {
    const user = userEvent.setup();
    render(<PreviewHarness />);

    expect(screen.getAllByText("OT-2048")[0]).toBeVisible();
    expect(screen.getAllByText("Corona zirconia")[0]).toBeVisible();

    await user.click(screen.getByRole("tab", { name: "Pagos" }));

    expect(screen.getByText("Factura 00481")).toBeVisible();
    expect(screen.getByText("Comprobante adjunto")).toBeVisible();
  });

  it("exposes four domain tabs and conceptual-data labeling", () => {
    render(<PreviewHarness />);

    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByText("Vista conceptual")).toBeVisible();
  });

  it("changes panels with arrow-key tab navigation", async () => {
    const user = userEvent.setup();
    render(<PreviewHarness />);
    const ordersTab = screen.getByRole("tab", { name: "Órdenes" });
    ordersTab.focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Producción" })).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(screen.getByRole("tab", { name: "Producción" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Por iniciar")).toBeVisible();
  });

  it("brands the product bar and keeps operational metrics inside Orders", () => {
    render(<PreviewHarness />);

    expect(screen.getByRole("img", { name: "Comelu" })).toHaveAttribute("src", "/comelu-horizontal.svg");
    expect(screen.getByRole("button", { name: "3 notificaciones" })).toBeVisible();
    expect(screen.getByLabelText("18 órdenes de trabajo activas")).toBeVisible();
    expect(screen.getByLabelText("3 entregas programadas para hoy")).toBeVisible();
  });

  it("exposes semantic tones on product records", () => {
    render(<PreviewHarness />);

    expect(screen.getAllByText("En producción")[0].closest("article")).toHaveAttribute("data-tone", "progress");
    expect(screen.getAllByText("Por iniciar")[0].closest("article")).toHaveAttribute("data-tone", "warning");
    expect(screen.getAllByText("Control de calidad")[0].closest("article")).toHaveAttribute("data-tone", "review");
  });
});
