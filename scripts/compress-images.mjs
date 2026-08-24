import sharp from "sharp";
import { readdir, stat, writeFile, rename } from "fs/promises";
import { join } from "path";

const dir = "public/album";

console.log("📷 开始压缩图片...\n");
let totalSaved = 0;

try {
  const files = await readdir(dir);
  const images = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f));

  if (images.length === 0) { console.log("未找到图片，跳过。"); process.exit(0); }

  for (const file of images) {
    const path = join(dir, file);
    const before = (await stat(path)).size;
    const ext = file.split(".").pop()?.toLowerCase();

    // 压缩：最大 1920px，质量 75
    let pipeline = sharp(path).resize(1920, 1920, { fit: "inside", withoutEnlargement: true });
    if (ext === "png")      pipeline = pipeline.png({ compressionLevel: 9 });
    else if (ext === "webp") pipeline = pipeline.webp({ quality: 75 });
    else                     pipeline = pipeline.jpeg({ quality: 75, mozjpeg: true });

    const buffer = await pipeline.toBuffer();
    const tmp = path + ".tmp";
    await writeFile(tmp, buffer);
    await rename(tmp, path);

    const after = (await stat(path)).size;
    const saved = before - after;
    totalSaved += saved;
    console.log(`  ${file}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (省 ${(saved/1024).toFixed(0)}KB)`);
  }
  console.log(`\n✅ 完成！总共节省 ${(totalSaved/1024/1024).toFixed(1)}MB\n`);
} catch { console.log("⚠️ 压缩跳过（目录不存在或无图片）"); }