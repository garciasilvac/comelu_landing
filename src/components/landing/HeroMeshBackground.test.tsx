import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroMeshBackground } from "./HeroMeshBackground";

describe("HeroMeshBackground", () => {
  it("is decorative and cannot receive focus", () => {
    const { container } = render(<HeroMeshBackground />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).not.toHaveAttribute("role", "img");
  });
});
