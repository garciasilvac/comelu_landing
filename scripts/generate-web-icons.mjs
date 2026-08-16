import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const canonicalSvg = join(publicDir, "favicon.svg");
const workspace = mkdtempSync(join(tmpdir(), "comelu-web-icons-"));

const run = (command, args) => execFileSync(command, args, { stdio: "ignore" });

const renderSvg = (svgPath, outputName) => {
  const outputPath = join(workspace, `${outputName}.png`);
  run("/usr/bin/sips", ["-s", "format", "png", svgPath, "--out", outputPath]);
  return outputPath;
};

const resize = (source, size, destination) => {
  run("/usr/bin/sips", ["-z", String(size), String(size), source, "--out", destination]);
};

const writeIco = (images, destination) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = Buffer.alloc(images.length * 16);
  let imageOffset = header.length + entries.length;

  images.forEach(({ size, data }, index) => {
    const entryOffset = index * 16;
    entries[entryOffset] = size;
    entries[entryOffset + 1] = size;
    entries[entryOffset + 2] = 0;
    entries[entryOffset + 3] = 0;
    entries.writeUInt16LE(1, entryOffset + 4);
    entries.writeUInt16LE(32, entryOffset + 6);
    entries.writeUInt32LE(data.length, entryOffset + 8);
    entries.writeUInt32LE(imageOffset, entryOffset + 12);
    imageOffset += data.length;
  });

  writeFileSync(destination, Buffer.concat([header, entries, ...images.map(({ data }) => data)]));
};

try {
  const standardSource = renderSvg(canonicalSvg, "standard");
  const standardOutputs = [
    [16, "favicon-16x16.png"],
    [32, "favicon-32x32.png"],
    [48, "favicon-48x48.png"],
    [180, "apple-touch-icon.png"],
    [192, "android-chrome-192x192.png"],
    [512, "android-chrome-512x512.png"],
  ];

  for (const [size, name] of standardOutputs) {
    resize(standardSource, size, join(publicDir, name));
  }

  const canonicalSource = readFileSync(canonicalSvg, "utf8");
  const maskableSvgSource = canonicalSource
    .replace(/<circle[^>]*\/>/, '<rect width="1254" height="1254" fill="#0369A1"/>')
    .replace("<path ", '<g transform="translate(62.7 62.7) scale(0.9)"><path ')
    .replace("</svg>", "</g></svg>");
  const maskableSvg = join(workspace, "maskable.svg");
  writeFileSync(maskableSvg, maskableSvgSource);

  const maskableRasterSource = renderSvg(maskableSvg, "maskable");
  resize(maskableRasterSource, 192, join(publicDir, "maskable-icon-192x192.png"));
  resize(maskableRasterSource, 512, join(publicDir, "maskable-icon-512x512.png"));

  const icoImages = [16, 32, 48].map((size) => ({
    size,
    data: readFileSync(join(publicDir, `favicon-${size}x${size}.png`)),
  }));
  writeIco(icoImages, join(publicDir, "favicon.ico"));

  console.log("Generated circular Comelu web icons.");
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
