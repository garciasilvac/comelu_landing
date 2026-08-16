import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) => resolve(process.cwd(), path);

const readPngSize = (path: string) => {
  const file = readFileSync(projectFile(path));
  expect(file.subarray(1, 4).toString("ascii")).toBe("PNG");
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
};

describe("web icon assets", () => {
  it("keeps the SVG master simple and brand-consistent", () => {
    const svg = readFileSync(projectFile("public/favicon.svg"), "utf8");
    const document = new DOMParser().parseFromString(svg, "image/svg+xml");

    expect(document.querySelector("parsererror")).toBeNull();
    expect(document.documentElement.getAttribute("viewBox")).toBe("0 0 1254 1254");
    expect(document.querySelectorAll("rect")).toHaveLength(1);
    expect(document.querySelectorAll("path")).toHaveLength(1);
    expect(svg).toContain("#015AB5");
    expect(svg).toContain("#FCB102");
    expect(svg).not.toMatch(/xlink|enable-background|opacity=/);
  });

  it("provides Safari a single-layer 16-unit monochrome mask", () => {
    const svg = readFileSync(projectFile("public/safari-pinned-tab.svg"), "utf8");
    const document = new DOMParser().parseFromString(svg, "image/svg+xml");

    expect(document.querySelector("parsererror")).toBeNull();
    expect(document.documentElement.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(document.querySelectorAll("path")).toHaveLength(1);
    expect(document.querySelector("path")?.getAttribute("transform")).toMatch(/^scale\(/);
    expect(document.querySelector("path")?.getAttribute("fill") ?? "black").toBe("black");
  });

  it.each([
    ["public/favicon-16x16.png", 16],
    ["public/favicon-32x32.png", 32],
    ["public/favicon-48x48.png", 48],
    ["public/apple-touch-icon.png", 180],
    ["public/android-chrome-192x192.png", 192],
    ["public/android-chrome-512x512.png", 512],
    ["public/maskable-icon-192x192.png", 192],
    ["public/maskable-icon-512x512.png", 512],
  ])("provides %s at the declared square size", (path, size) => {
    expect(readPngSize(path)).toEqual({ width: size, height: size });
  });

  it("provides a multi-resolution favicon.ico", () => {
    const ico = readFileSync(projectFile("public/favicon.ico"));

    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);
    expect([ico[6], ico[22], ico[38]]).toEqual([16, 32, 48]);
  });

  it("describes installable PWA icons in the web manifest", () => {
    const manifest = JSON.parse(readFileSync(projectFile("public/site.webmanifest"), "utf8"));

    expect(manifest.name).toBe("Comelu");
    expect(manifest.id).toBe("/");
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/android-chrome-192x192.png", sizes: "192x192", purpose: "any" }),
        expect.objectContaining({ src: "/android-chrome-512x512.png", sizes: "512x512", purpose: "any" }),
        expect.objectContaining({ src: "/maskable-icon-192x192.png", sizes: "192x192", purpose: "maskable" }),
        expect.objectContaining({ src: "/maskable-icon-512x512.png", sizes: "512x512", purpose: "maskable" }),
      ]),
    );
  });
});
