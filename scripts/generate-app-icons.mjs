import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");
const iconDir = path.join(publicDir, "icons");

const roundedSource = path.join(publicDir, "spark-favicon.svg");
const fullBleedSource = path.join(publicDir, "spark-app-icon-negative.svg");

const targets = [
  { source: roundedSource, output: "spark-favicon-negative-32.png", size: 32 },
  { source: roundedSource, output: "spark-pwa-negative-192.png", size: 192 },
  { source: roundedSource, output: "spark-pwa-negative-512.png", size: 512 },
  { source: fullBleedSource, output: "spark-maskable-negative-512.png", size: 512 },
  { source: fullBleedSource, output: "spark-apple-negative-180.png", size: 180 },
];

await mkdir(iconDir, { recursive: true });

for (const target of targets) {
  const outputPath = path.join(iconDir, target.output);
  await sharp(target.source)
    .resize(target.size, target.size)
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();
  if (metadata.width !== target.size || metadata.height !== target.size || metadata.format !== "png") {
    throw new Error(`Invalid generated icon: ${target.output}`);
  }

  console.log(`${target.output}: ${metadata.width}x${metadata.height}`);
}
