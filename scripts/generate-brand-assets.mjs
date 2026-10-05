import { readFile, writeFile, copyFile } from "node:fs/promises";
import sharp from "sharp";

// Reuse the approved wordmark outlines. No font substitution or retracing.
const wordmark = await readFile("assets/logo/spark-wordmark.svg", "utf8");
const path = wordmark.match(/<path\b[^>]*\/>/)?.[0];
if (!path) throw new Error("Missing canonical wordmark path");
const icon = await readFile("public/spark-favicon-v2.svg", "utf8");
const badge = icon.replace('<svg ', '<svg x="133" y="152" ').replace('width="512" height="512"', 'width="480" height="480"');
for (const [variant, color, name] of [
  ["primary", "#65458A", "spark-logo"],
  ["negative", "#FFFFFF", "spark-logo-negative"],
]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 768" role="img" aria-labelledby="title desc"><title id="title">Spark ${variant} logo</title><desc id="desc">Approved circular check app icon with the original spark wordmark.</desc>${badge}${path.replace('fill="#65458A"', `fill="${color}"`)}</svg>\n`;
  const source = `assets/logo/spark-logo-${variant}-v2.svg`;
  const png = `assets/logo/spark-logo-${variant}-v2.png`;
  await writeFile(source, svg);
  await sharp(Buffer.from(svg)).resize(2048, 768).png().toFile(png);
  for (const ext of ["svg", "png"]) {
    const input = `assets/logo/spark-logo-${variant}-v2.${ext}`;
    await copyFile(input, `assets/logo/spark-logo-${variant}.${ext}`);
    await copyFile(input, `public/brand/${name}-v2.${ext}`);
    await copyFile(input, `public/brand/${name}.${ext}`);
  }
  console.log(`${variant} logo: SVG and PNG, canonical + public aliases`);
}
await copyFile("public/spark-favicon-v2.svg", "public/spark-mark-v2.svg");
console.log("Compact mark: approved v2 badge");
