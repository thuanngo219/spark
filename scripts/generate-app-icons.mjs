import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.join(process.cwd(), "public");
const iconDir = path.join(publicDir, "icons");
const source = await readFile("assets/logo/spark-app-icon-v2.svg", "utf8");
const body = source.replace(/^<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const background = body.match(/<path\b[^>]*fill="url\(#[^)]+\)"[^>]*\/>/)?.[0];
if (!background) throw new Error("Expected the approved gradient background path");
const wrap = (content) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">${content}</svg>\n`;
const rounded = wrap(`<defs><clipPath id="app-rounded"><rect width="512" height="512" rx="116"/></clipPath></defs><g clip-path="url(#app-rounded)">${body}</g>`);
// Keep the background full bleed; only scale the white artwork into the
// maskable safe circle (radius 40% of the canvas), preserving its geometry.
const maskable = wrap(`${background}<g transform="translate(256 256) scale(.9) translate(-256 -256)">${body.replace(background, "")}</g>`);
const variants = { rounded, full: source, maskable };
await mkdir(iconDir, { recursive: true });
await writeFile(path.join(publicDir, "spark-favicon-v2.svg"), rounded);
await writeFile(path.join(iconDir, "spark-app-v2.svg"), source);
await writeFile(path.join(iconDir, "spark-maskable-v2.svg"), maskable);

const targets = [
  { variant: "rounded", output: "spark-favicon-v2-16.png", size: 16 },
  { variant: "rounded", output: "spark-favicon-v2-32.png", size: 32 },
  { variant: "rounded", output: "spark-favicon-v2-48.png", size: 48 },
  { variant: "rounded", output: "spark-pwa-v2-192.png", size: 192 },
  { variant: "rounded", output: "spark-pwa-v2-512.png", size: 512 },
  { variant: "maskable", output: "spark-maskable-v2-512.png", size: 512 },
  { variant: "full", output: "spark-apple-v2-180.png", size: 180 },
];
for (const target of targets) {
  await sharp(Buffer.from(variants[target.variant]))
    .resize(target.size, target.size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(iconDir, target.output));
  console.log(`${target.output}: ${target.size}x${target.size}`);
}

// ICO directory with PNG entries for legacy favicon consumers.
const faviconTargets = targets.filter(({ size }) => size <= 48);
const images = await Promise.all(faviconTargets.map(({ output }) => readFile(path.join(iconDir, output))));
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  header[entry] = header[entry + 1] = faviconTargets[index].size;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(image.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await writeFile(path.join(publicDir, "spark-favicon-v2.ico"), Buffer.concat([header, ...images]));
console.log("spark-favicon-v2.ico: 16, 32, 48px");
