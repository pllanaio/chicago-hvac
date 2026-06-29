import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const assetsDir = path.join(root, "assets");
const skylinePng = path.join(assetsDir, "chicago-skyline.png");
const skylineWebp = path.join(assetsDir, "chicago-skyline.webp");
const skylineAvif = path.join(assetsDir, "chicago-skyline.avif");

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function optimizeHeroImage() {
  if (!(await exists(skylinePng))) {
    console.warn("Skipping hero image optimization: assets/chicago-skyline.png not found.");
    return;
  }

  const image = sharp(skylinePng).resize({
    width: 1920,
    withoutEnlargement: true,
  });

  await Promise.all([
    image.clone().webp({ quality: 78, effort: 6 }).toFile(skylineWebp),
    image.clone().avif({ quality: 55, effort: 6 }).toFile(skylineAvif),
  ]);

  console.log("Optimized hero image: AVIF and WebP generated.");
}

await optimizeHeroImage();
