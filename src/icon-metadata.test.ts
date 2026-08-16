import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("web icon metadata", () => {
  it("connects browser, Apple, Safari, and PWA assets", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    const document = new DOMParser().parseFromString(html, "text/html");

    expect(document.querySelector('link[rel="icon"][href="/favicon.svg"]')).not.toBeNull();
    expect(document.querySelector('link[rel="icon"][href="/favicon.ico"]')).not.toBeNull();
    expect(document.querySelector('link[rel="icon"][href="/favicon-32x32.png"][sizes="32x32"]')).not.toBeNull();
    expect(document.querySelector('link[rel="icon"][href="/favicon-16x16.png"][sizes="16x16"]')).not.toBeNull();
    expect(document.querySelector('link[rel="apple-touch-icon"][href="/apple-touch-icon.png"]')).not.toBeNull();
    expect(document.querySelector('link[rel="mask-icon"][href="/safari-pinned-tab.svg"]')).not.toBeNull();
    expect(document.querySelector('link[rel="manifest"][href="/site.webmanifest"]')).not.toBeNull();
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe("#015AB5");
    expect(document.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute("content")).toBe("Comelu");
  });
});
