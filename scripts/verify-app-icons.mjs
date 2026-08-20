import path from "node:path";
import sharp from "sharp";

const iconDir = path.join(process.cwd(), "public", "icons");
const navy = [17, 23, 66];
const white = [255, 255, 255];

const targets = [
  { file: "spark-favicon-negative-32.png", size: 32, fullBleed: false },
  { file: "spark-pwa-negative-192.png", size: 192, fullBleed: false },
  { file: "spark-pwa-negative-512.png", size: 512, fullBleed: false },
  { file: "spark-maskable-negative-512.png", size: 512, fullBleed: true },
  { file: "spark-apple-negative-180.png", size: 180, fullBleed: true },
];

function closeTo(actual, expected, tolerance = 2) {
  return actual.every((value, index) => Math.abs(value - expected[index]) <= tolerance);
}

for (const target of targets) {
  const filePath = path.join(iconDir, target.file);
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== target.size || info.height !== target.size || info.channels !== 4) {
    throw new Error(`Unexpected dimensions/channels for ${target.file}`);
  }

  let navyPixels = 0;
  let whitePixels = 0;
  for (let index = 0; index < data.length; index += 4) {
    const rgba = [data[index], data[index + 1], data[index + 2], data[index + 3]];
    if (rgba[3] === 255 && closeTo(rgba.slice(0, 3), navy)) navyPixels += 1;
    if (rgba[3] === 255 && closeTo(rgba.slice(0, 3), white)) whitePixels += 1;
  }

  const totalPixels = info.width * info.height;
  if (navyPixels / totalPixels < 0.45 || whitePixels / totalPixels < 0.03) {
    throw new Error(`Unexpected Navy/negative coverage for ${target.file}`);
  }

  const cornerAlpha = data[3];
  if (target.fullBleed && (cornerAlpha !== 255 || !closeTo([...data.slice(0, 3)], navy))) {
    throw new Error(`Expected a full-bleed Navy corner for ${target.file}`);
  }
  if (!target.fullBleed && cornerAlpha !== 0) {
    throw new Error(`Expected a transparent rounded corner for ${target.file}`);
  }

  console.log(`${target.file}: verified`);
}
