import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const iconDir = path.join(process.cwd(), "public", "icons");
const targets = [
  { file: "spark-favicon-v2-16.png", size: 16, rounded: true },
  { file: "spark-favicon-v2-32.png", size: 32, rounded: true },
  { file: "spark-favicon-v2-48.png", size: 48, rounded: true },
  { file: "spark-pwa-v2-192.png", size: 192, rounded: true },
  { file: "spark-pwa-v2-512.png", size: 512, rounded: true },
  { file: "spark-maskable-v2-512.png", size: 512, maskable: true },
  { file: "spark-apple-v2-180.png", size: 180 },
];

for (const target of targets) {
  const { data, info } = await sharp(path.join(iconDir, target.file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, target.size);
  assert.equal(info.height, target.size);
  let whitePixels = 0;
  for (let index = 0; index < data.length; index += 4) {
    const [r, g, b, alpha] = data.subarray(index, index + 4);
    if (alpha === 255) assert.ok(r >= 10 && g >= 15 && b >= 50, `${target.file}: unexpected dark fill in artwork`);
    if (!target.rounded) assert.equal(alpha, 255, `${target.file}: background must be opaque`);
    if (r > 180 && g > 180 && b > 180 && alpha === 255) {
      whitePixels += 1;
      if (target.maskable) {
        const x = (index / 4) % info.width + 0.5 - info.width / 2;
        const y = Math.floor(index / 4 / info.width) + 0.5 - info.height / 2;
        assert.ok(Math.hypot(x, y) <= info.width * 0.4, "Maskable artwork leaves the safe zone");
      }
    }
  }
  assert.ok(whitePixels / (info.width * info.height) > 0.04, `${target.file}: missing white artwork`);
  if (target.rounded) assert.equal(data[3], 0, `${target.file}: rounded corner must be transparent`);
  // Sample the clear upper-left interior against an outer Navy edge.
  const sample = (x, y) => [...data.subarray((y * info.width + x) * 4, (y * info.width + x) * 4 + 3)];
  const inner = sample(Math.floor(info.width * 0.36), Math.floor(info.height * 0.36));
  const edge = sample(Math.floor(info.width / 2), 0);
  assert.ok(inner[2] > edge[2] + 30, `${target.file}: expected the approved blue radial gradient`);
  console.log(`${target.file}: verified dimensions, artwork, background${target.maskable ? " and safe zone" : ""}`);
}

const approved = await readFile("assets/logo/spark-app-icon-v2.svg");
assert.deepEqual(await readFile("public/icons/spark-app-v2.svg"), approved, "Full-bleed SVG must preserve the supplied source");
const ico = await readFile("public/spark-favicon-v2.ico");
assert.equal(ico.readUInt16LE(2), 1);
assert.equal(ico.readUInt16LE(4), 3);
for (const [index, size] of [16, 32, 48].entries()) {
  const entry = 6 + index * 16;
  assert.equal(ico[entry], size);
  assert.equal(ico[entry + 1], size);
  const length = ico.readUInt32LE(entry + 8);
  const offset = ico.readUInt32LE(entry + 12);
  assert.deepEqual(ico.subarray(offset, offset + length), await readFile(path.join(iconDir, `spark-favicon-v2-${size}.png`)));
}
console.log("Approved SVG source and multi-size ICO verified");
