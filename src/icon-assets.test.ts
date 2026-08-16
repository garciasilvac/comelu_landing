import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) => resolve(process.cwd(), path);

const paethPredictor = (left: number, above: number, upperLeft: number) => {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);

  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  if (aboveDistance <= upperLeftDistance) return above;
  return upperLeft;
};

const parsePng = (file: Buffer) => {
  expect(file.subarray(1, 4).toString("ascii")).toBe("PNG");
  const width = file.readUInt32BE(16);
  const height = file.readUInt32BE(20);
  const bitDepth = file[24];
  const colorType = file[25];
  const idatChunks: Buffer[] = [];

  for (let offset = 8; offset < file.length; ) {
    const length = file.readUInt32BE(offset);
    const type = file.subarray(offset + 4, offset + 8).toString("ascii");
    if (type === "IDAT") idatChunks.push(file.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }

  expect(bitDepth).toBe(8);
  expect(colorType).toBe(6);

  const bytesPerPixel = 4;
  const rowBytes = width * bytesPerPixel;
  const filtered = inflateSync(Buffer.concat(idatChunks));
  const pixels = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y += 1) {
    const filter = filtered[y * (rowBytes + 1)];
    const filteredRow = y * (rowBytes + 1) + 1;
    const outputRow = y * rowBytes;

    expect(filter).toBeLessThanOrEqual(4);

    for (let x = 0; x < rowBytes; x += 1) {
      const left = x >= bytesPerPixel ? pixels[outputRow + x - bytesPerPixel] : 0;
      const above = y > 0 ? pixels[outputRow - rowBytes + x] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel ? pixels[outputRow - rowBytes + x - bytesPerPixel] : 0;
      const source = filtered[filteredRow + x];
      const predictor =
        filter === 0
          ? 0
          : filter === 1
            ? left
            : filter === 2
              ? above
              : filter === 3
                ? Math.floor((left + above) / 2)
                : paethPredictor(left, above, upperLeft);

      pixels[outputRow + x] = (source + predictor) & 0xff;
    }
  }

  return {
    width,
    height,
    colorType,
    alphaAt: (x: number, y: number) => pixels[(y * width + x) * bytesPerPixel + 3],
  };
};

const readPng = (path: string) => parsePng(readFileSync(projectFile(path)));

describe("web icon assets", () => {
  it("uses a preset-aligned circular SVG with transparent outer corners", () => {
    const svg = readFileSync(projectFile("public/favicon.svg"), "utf8");
    const document = new DOMParser().parseFromString(svg, "image/svg+xml");

    expect(document.querySelector("parsererror")).toBeNull();
    expect(document.documentElement.getAttribute("viewBox")).toBe("0 0 1254 1254");
    expect(document.querySelectorAll("circle")).toHaveLength(1);
    expect(document.querySelectorAll("rect")).toHaveLength(0);
    expect(document.querySelectorAll("path")).toHaveLength(1);
    expect(svg).toContain("#0369A1");
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
    const png = readPng(path);
    expect({ width: png.width, height: png.height }).toEqual({ width: size, height: size });
  });

  it.each([
    "public/favicon-16x16.png",
    "public/favicon-32x32.png",
    "public/favicon-48x48.png",
    "public/apple-touch-icon.png",
    "public/android-chrome-192x192.png",
    "public/android-chrome-512x512.png",
  ])("keeps %s transparent outside the circular mark", (path) => {
    const png = readPng(path);

    expect(png.alphaAt(0, 0)).toBe(0);
    expect(png.alphaAt(Math.floor(png.width / 2), Math.floor(png.height / 2))).toBe(255);
  });

  it.each(["public/maskable-icon-192x192.png", "public/maskable-icon-512x512.png"])(
    "keeps %s opaque for adaptive platform masks",
    (path) => {
      const png = readPng(path);

      expect(png.alphaAt(0, 0)).toBe(255);
      expect(png.alphaAt(Math.floor(png.width / 2), Math.floor(png.height / 2))).toBe(255);
    },
  );

  it("stores transparent circular images at every ICO resolution", () => {
    const ico = readFileSync(projectFile("public/favicon.ico"));

    for (let index = 0; index < ico.readUInt16LE(4); index += 1) {
      const entry = 6 + index * 16;
      const length = ico.readUInt32LE(entry + 8);
      const offset = ico.readUInt32LE(entry + 12);
      expect(parsePng(ico.subarray(offset, offset + length)).alphaAt(0, 0)).toBe(0);
    }
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
    expect(manifest.theme_color).toBe("#0369A1");
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
